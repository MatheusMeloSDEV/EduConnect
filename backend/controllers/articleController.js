const Article = require('../models/Article');
const { ArticleUpvote } = require('../models/Interaction');

exports.getAllArticles = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const query = {};
        if (search) {
            query.$or = [
                { headline: { $regex: search, $options: 'i' } },
                { body: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
        
        const articles = await Article.find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('writer', 'fullName avatar institution role');

        const total = await Article.countDocuments(query);
        const currentUserId = req.user ? req.user.userId : null;

        // Check upvote status for current user
        let articlesWithStatus = articles.map(a => a.toObject());
        if (currentUserId) {
            try {
                const upvotes = await ArticleUpvote.find({ 
                    user: currentUserId, 
                    article: { $in: articles.map(a => a._id) } 
                });
                const upvotedIds = new Set(upvotes.map(u => u.article.toString()));
                articlesWithStatus = articlesWithStatus.map(a => ({
                    ...a,
                    userUpvoted: upvotedIds.has(a._id.toString())
                }));
            } catch (err) {
                console.error("Error fetching upvotes:", err);
            }
        }

        res.json({
            success: true,
            data: articlesWithStatus,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalArticles: total
            }
        });
    } catch (error) {
        console.error("getAllArticles Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPopularArticles = async (req, res) => {
    try {
        const articles = await Article.find()
            .sort({ upvotes: -1 })
            .limit(3)
            .populate('writer', 'fullName avatar institution role');
            
        res.json({ success: true, data: articles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('writer', 'fullName avatar institution role');

        if (!article) return res.status(404).json({ success: false, message: "Artigo não encontrado" });
        
        const currentUserId = req.user ? req.user.userId : null;
        let articleObj = article.toObject();

        if (currentUserId) {
            try {
                const upvote = await ArticleUpvote.findOne({ user: currentUserId, article: article._id });
                articleObj.userUpvoted = !!upvote;
            } catch (err) {
                console.error("Error fetching single upvote:", err);
            }
        }

        res.json({ success: true, data: articleObj });
    } catch (error) {
        console.error("getArticleById Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createArticle = async (req, res) => {
    try {
        if (req.user.role !== 'professor') {
            return res.status(403).json({ success: false, message: "Apenas professores podem criar artigos" });
        }

        const { headline, summary, body, tags, imageUrl } = req.body;
        
        const newArticle = new Article({
            headline, summary, body, 
            tags: tags || [],
            imageUrl: imageUrl || "https://picsum.photos/800/600",
            writer: req.user.userId
        });

        await newArticle.save();
        await newArticle.populate('writer', 'fullName avatar');

        res.status(201).json({ success: true, message: "Artigo criado", data: newArticle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ success: false, message: "Artigo não encontrado" });
        
        if (article.writer.toString() !== req.user.userId && req.user.role !== 'professor') {
            return res.status(403).json({ success: false, message: "Sem permissão" });
        }

        Object.assign(article, req.body);
        await article.save();
        await article.populate('writer', 'fullName avatar');

        res.json({ success: true, message: "Artigo atualizado", data: article });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ success: false, message: "Artigo não encontrado" });

        if (article.writer.toString() !== req.user.userId && req.user.role !== 'professor') {
            return res.status(403).json({ success: false, message: "Sem permissão" });
        }

        await Article.deleteOne({ _id: article._id });
        await ArticleUpvote.deleteMany({ article: article._id });
        
        res.json({ success: true, message: "Artigo deletado" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.toggleUpvote = async (req, res) => {
    try {
        const articleId = req.params.id;
        const userId = req.user.userId;

        console.log(`Toggling upvote for User ${userId} on Article ${articleId}`);

        const article = await Article.findById(articleId);
        if (!article) return res.status(404).json({ success: false, message: "Artigo não encontrado" });

        const existingUpvote = await ArticleUpvote.findOne({ user: userId, article: articleId });
        let upvoted = false;

        if (existingUpvote) {
            await ArticleUpvote.deleteOne({ _id: existingUpvote._id });
            article.upvotes = Math.max(0, article.upvotes - 1);
        } else {
            // Ensure no race conditions creating duplicates (handled by unique index in model, but good to catch)
            try {
                await ArticleUpvote.create({ user: userId, article: articleId });
                article.upvotes += 1;
                upvoted = true;
            } catch (e) {
                if (e.code === 11000) {
                   // Already exists (race condition), treat as upvoted
                   upvoted = true; 
                } else {
                   throw e;
                }
            }
        }
        
        await article.save();
        console.log(`Upvote success. New Count: ${article.upvotes}, UserUpvoted: ${upvoted}`);
        
        res.json({ success: true, data: { upvotes: article.upvotes, upvoted } });
    } catch (error) {
        console.error("toggleUpvote Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};