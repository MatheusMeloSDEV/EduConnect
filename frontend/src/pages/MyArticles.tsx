import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Article } from "../types";
import { articleService } from "../services/api";
import { FaArrowLeft, FaRegHeart, FaRegCommentDots, FaPen, FaPlus } from "react-icons/fa";

function MyArticles() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      articleService.getArticlesByAuthor(user._id)
        .then(res => setArticles(res.data))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 md:bg-gray-200 md:py-10">
      <div className="w-full md:max-w-4xl bg-white min-h-screen md:min-h-0 md:h-[80vh] md:rounded-3xl relative shadow-none md:shadow-xl flex flex-col overflow-hidden">
        
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate(-1)} className="text-gray-600 p-2 -ml-2 rounded-full active:bg-gray-100 hover:bg-gray-50 transition">
              <FaArrowLeft />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Meus Artigos</h1>
          </div>
          <button onClick={() => navigate('/articles/create')} className="text-purple-600 font-bold text-sm flex items-center gap-1 hover:bg-purple-50 px-3 py-2 rounded-lg transition">
            <FaPlus size={12}/> <span className="hidden md:inline">Novo Artigo</span><span className="md:hidden">Novo</span>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {loading && <div className="text-center text-gray-500 mt-10">Carregando...</div>}
          
          {!loading && articles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full pb-20">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-6 text-gray-300">
                <FaPen size={40} />
              </div>
              <h3 className="text-gray-800 font-bold text-xl mb-2">Nenhum artigo ainda</h3>
              <p className="text-gray-500 text-sm mb-8 text-center max-w-xs">Você ainda não publicou nada. Compartilhe seu conhecimento com a comunidade!</p>
              <button 
                onClick={() => navigate('/articles/create')}
                className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-purple-700 active:scale-95 transition-all"
              >
                Escrever Primeiro Artigo
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map(article => (
                <div 
                key={article._id}
                onClick={() => navigate(`/articles/${article._id}`)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 active:scale-[0.99] hover:border-purple-200 hover:shadow-md transition-all cursor-pointer"
                >
                <img src={article.imageUrl} alt="" className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover flex-shrink-0" />
                <div className="flex flex-col justify-between py-1 flex-1">
                    <div>
                    <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight line-clamp-2">{article.headline}</h3>
                    <p className="text-gray-400 text-xs mt-1">{new Date(article.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                    <span className="flex items-center gap-1"><FaRegHeart /> {article.upvotes}</span>
                    <span className="flex items-center gap-1"><FaRegCommentDots /> {article.reviews}</span>
                    </div>
                </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyArticles;