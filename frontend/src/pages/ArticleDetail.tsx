import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Article, Comment } from "../types";
import { articleService, commentService } from "../services/api";
import { FaArrowLeft, FaHeart, FaRegHeart, FaPaperPlane } from "react-icons/fa";

function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (id) {
      articleService.getArticleById(id).then(res => setArticle(res.data));
      commentService.getCommentsByArticle(id).then(res => setComments(res.data));
    }
  }, [id]);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleSendComment = async () => {
    if(!commentText.trim() || !id) return;
    const res = await commentService.createComment({ message: commentText, articleId: id });
    setComments([...comments, res.data]);
    setCommentText("");
  };

  if (!article) return <div className="p-10 text-center text-gray-500">Carregando conteúdo...</div>;

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 pb-20 md:pb-10">
      
      {/* Desktop Wrapper: Standard centered blog layout */}
      <div className="w-full md:max-w-5xl mx-auto bg-white md:shadow-sm md:rounded-b-2xl md:min-h-screen">
        
        {/* Header Image - Increased height to 500px on desktop */}
        <div className="relative h-72 md:h-[500px] w-full group">
          <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-40 opacity-80" />
          
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-6 left-6 text-white p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 transition flex items-center gap-2 pr-4"
          >
            <FaArrowLeft size={16} /> <span className="text-sm font-bold hidden md:inline">Voltar</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 md:px-20 py-8 md:py-16">
          
          {/* Metadata */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-purple-700 bg-purple-50 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
              {article.tags[0]}
            </span>
            <span className="text-gray-400 text-sm">
              {new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">{article.headline}</h1>

          {/* Author Bar */}
          <div className="flex items-center justify-between border-y border-gray-100 py-6 mb-10">
            <div className="flex items-center gap-4">
               <img src={article.writer.avatar} className="w-12 h-12 rounded-full ring-2 ring-gray-100" />
               <div>
                 <p className="font-bold text-gray-900 text-base">{article.writer.fullName}</p>
                 <p className="text-sm text-purple-600 font-medium">{article.writer.role} • {article.writer.institution}</p>
               </div>
            </div>
            
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${
                  liked 
                  ? 'bg-red-50 border-red-100 text-red-600' 
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {liked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
              <span className="font-bold text-sm">{liked ? 'Curtido' : 'Curtir'}</span>
            </button>
          </div>

          {/* Article Text */}
          <div className="prose prose-lg md:prose-xl prose-purple max-w-none text-gray-700 leading-relaxed font-serif md:font-sans">
            <p className="whitespace-pre-wrap">{article.body}</p>
          </div>

          {/* Comments Section */}
          <div className="mt-16 pt-10 border-t border-gray-100">
            <h3 className="font-bold text-2xl text-gray-900 mb-8 flex items-center gap-3">
                Comentários <span className="bg-gray-100 text-gray-600 text-sm px-2.5 py-0.5 rounded-full font-medium">{comments.length}</span>
            </h3>
            
            {/* Input */}
            <div className="flex gap-4 items-start mb-10">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" /> {/* Placeholder for current user avatar */}
                <div className="flex-1 relative">
                    <textarea 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Escreva um comentário..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-y"
                    />
                    <div className="flex justify-end mt-2">
                        <button 
                        onClick={handleSendComment}
                        disabled={!commentText.trim()}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-purple-700 transition"
                        >
                        Publicar
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-6">
              {comments.map(c => (
                <div key={c._id} className="flex gap-4">
                  <img src={c.reviewer.avatar || "https://picsum.photos/50"} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                  <div>
                    <div className="bg-gray-50 px-5 py-3 rounded-2xl rounded-tl-none">
                        <p className="text-sm font-bold text-gray-900 mb-1">{c.reviewer.fullName}</p>
                        <p className="text-base text-gray-700 leading-relaxed">{c.message}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-2 text-xs font-medium text-gray-500">
                        <button className="hover:text-purple-600">Curtir</button>
                        <button className="hover:text-purple-600">Responder</button>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleDetail;