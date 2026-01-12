const Review = require('../models/Review');
const Article = require('../models/Article');
const { ReviewLike } = require('../models/Interaction');

exports.getReviewsByArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await Review.find({ article: id, parentReview: null })
            .sort({ createdAt: -1 })
            .populate('reviewer', 'fullName avatar role');

        const currentUserId = req.user ? req.user.userId : null;
        let reviewsWithStatus = reviews.map(r => r.toObject());

        if (currentUserId) {
            try {
                const likes = await ReviewLike.find({ 
                    user: currentUserId, 
                    review: { $in: reviews.map(r => r._id) } 
                });
                const likedIds = new Set(likes.map(l => l.review.toString()));
                reviewsWithStatus = reviewsWithStatus.map(r => ({
                    ...r,
                    userLiked: likedIds.has(r._id.toString())
                }));
            } catch (err) {
                 console.error("Error fetching review likes:", err);
            }
        }

        res.json({ success: true, data: reviewsWithStatus });
    } catch (error) {
        console.error("getReviewsByArticle Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { message, articleId, parentReviewId } = req.body;
        if (!message || !articleId) return res.status(400).json({ success: false, message: "Dados incompletos" });

        const newReview = new Review({
            message,
            article: articleId,
            parentReview: parentReviewId || null,
            reviewer: req.user.userId
        });

        await newReview.save();
        await newReview.populate('reviewer', 'fullName avatar');

        // Increment review count on article manually if middleware fails or for redundancy
        await Article.findByIdAndUpdate(articleId, { $inc: { reviews: 1 } });

        res.status(201).json({ success: true, message: "Comentário adicionado", data: newReview });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.toggleReviewLike = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.userId;

        console.log(`Toggling like for User ${userId} on Review ${reviewId}`);

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ success: false, message: "Comentário não encontrado" });

        const existingLike = await ReviewLike.findOne({ user: userId, review: reviewId });
        let liked = false;

        if (existingLike) {
            await ReviewLike.deleteOne({ _id: existingLike._id });
            review.upvotes = Math.max(0, review.upvotes - 1);
        } else {
             try {
                await ReviewLike.create({ user: userId, review: reviewId });
                review.upvotes += 1;
                liked = true;
            } catch (e) {
                if (e.code === 11000) {
                    liked = true;
                } else {
                    throw e;
                }
            }
        }

        await review.save();
        res.json({ success: true, data: { upvotes: review.upvotes, liked } });
    } catch (error) {
        console.error("toggleReviewLike Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false });

        if (review.reviewer.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Sem permissão" });
        }

        const articleId = review.article;
        await Review.deleteOne({ _id: review._id });
        await ReviewLike.deleteMany({ review: review._id });
        
        // Decrement article review count
        await Article.findByIdAndUpdate(articleId, { $inc: { reviews: -1 } });

        res.json({ success: true, message: "Comentário deletado" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};