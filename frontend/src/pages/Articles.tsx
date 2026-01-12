import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Article } from "../types";
import { articleService } from "../services/api";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FaSearch, FaRegHeart, FaRegCommentDots, FaFilter, FaPlus } from "react-icons/fa";

function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    articleService.getArticles().then(res => setArticles(res.data));
  }, []);

  const filtered = articles.filter(a => a.headline.toLowerCase().includes(searchTerm.toLowerCase()));
  const isProfessor = user?.role === 'professor';

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-6 md:px-0 pt-6 md:pt-0">
         <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Explorar</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Descubra novos conteúdos da comunidade.</p>
         </div>
         
         <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar artigos..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-10 pr-4 py-2.5 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all"
                />
            </div>
            <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition">
                <FaFilter />
            </button>
            {isProfessor && (
              <button 
                  onClick={() => navigate('/articles/create')}
                  className="hidden md:flex bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold items-center gap-2 hover:bg-purple-700 shadow-sm transition"
              >
                  <FaPlus /> <span className="hidden lg:inline">Novo Artigo</span>
              </button>
            )}
         </div>
      </div>

      <div className="px-6 md:px-0 pb-24">
        {/* Responsive Grid: 1 -> 2 -> 3 -> 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filtered.map(article => (
            <div 
                key={article._id}
                onClick={() => navigate(`/articles/${article._id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 group hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-900 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
                {/* Increased image height to h-64 (256px) on desktop */}
                <div className="relative h-48 md:h-64 overflow-hidden">
                   <img src={article.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-purple-700 dark:text-purple-400 shadow-sm">
                       {article.tags[0]}
                   </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <img src={article.writer.avatar} className="w-6 h-6 rounded-full" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{article.writer.fullName}</span>
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{article.headline}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-1 leading-relaxed">{article.summary}</p>
                    
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(article.createdAt).toLocaleDateString()}</span>
                        <div className="flex gap-4 text-gray-400 dark:text-gray-500 text-sm">
                            <span className="flex items-center gap-1.5 hover:text-red-500 transition"><FaRegHeart /> {article.upvotes}</span>
                            <span className="flex items-center gap-1.5 hover:text-blue-500 transition"><FaRegCommentDots /> {article.reviews}</span>
                        </div>
                    </div>
                </div>
            </div>
            ))}
        </div>
      </div>

      {/* Floating Action Button (Mobile Only) - Only for Professors */}
      {isProfessor && (
        <button 
          onClick={() => navigate('/articles/create')}
          className="md:hidden fixed bottom-24 right-6 bg-purple-600 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform z-40"
        >
          <FaPlus size={24} />
        </button>
      )}
    </Layout>
  );
}

export default Articles;