import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import useAuth from "../hooks/useAuth";
import { Article } from "../types";
import { articleService } from "../services/api";
import { useNavigate } from "react-router-dom";
import { FaFire, FaRegHeart, FaRegCommentDots, FaArrowRight, FaPlus } from "react-icons/fa";

function Home() {
  const { user } = useAuth();
  const [popular, setPopular] = useState<Article[]>([]);
  const [recent, setRecent] = useState<Article[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get popular items
    articleService.getPopularArticles().then(res => setPopular(res.data));
    // Also get general articles for the vertical feed
    articleService.getArticles().then(res => setRecent(res.data.slice(0, 5)));
  }, []);

  const isProfessor = user?.role === 'professor';

  return (
    <Layout>
      {/* Welcome Header */}
      <div className={`bg-gradient-to-r ${isProfessor ? 'from-indigo-800 to-purple-800' : 'from-purple-700 to-purple-600'} p-6 md:p-12 md:rounded-2xl shadow-sm relative overflow-hidden mb-6 md:min-h-[200px] flex flex-col justify-end transition-colors`}>
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-row items-center justify-between gap-4 mt-12 md:mt-0">
          <div className="flex items-center gap-4">
            <img src={user?.avatar} alt="Avatar" className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 border-white/30 shadow-md object-cover" />
            <div>
              <p className="text-purple-200 text-xs font-medium uppercase tracking-wider mb-0.5">
                  {isProfessor ? 'Professor(a)' : 'Aluno(a)'}
              </p>
              <h1 className="text-white font-bold text-xl md:text-3xl leading-none">
                  {isProfessor ? `Olá, Prof. ${user?.fullName.split(' ')[0]}` : `Olá, ${user?.fullName.split(' ')[0]}`}
              </h1>
              <p className="text-white/80 text-xs md:text-sm mt-1 hidden md:block">
                  {isProfessor ? 'Pronto para inspirar seus alunos hoje?' : 'Vamos aprender algo novo hoje?'}
              </p>
            </div>
          </div>
          
          <button 
             onClick={() => navigate(isProfessor ? '/articles/create' : '/articles')} 
             className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2"
          >
             {isProfessor ? <><FaPlus /> Criar Artigo</> : 'Explorar'}
          </button>
        </div>
      </div>

      <div className="pb-10">
        
        {/* Horizontal Scroll Section (Trending) - Mobile App Style */}
        <div className="mb-8">
            <div className="flex items-center justify-between px-6 mb-4">
                <div className="flex items-center gap-2">
                    <FaFire className="text-orange-500" />
                    <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Em Alta</h2>
                </div>
            </div>

            {/* Changed gap-4 to gap-5 and using padding to help with snap alignment */}
            <div className="smooth-scroll-x flex overflow-x-auto pb-4 px-6 gap-5 no-scrollbar snap-x snap-mandatory scroll-pl-6">
                {popular.map((article) => (
                    <div 
                        key={article._id} 
                        onClick={() => navigate(`/articles/${article._id}`)}
                        className="snap-start min-w-[80vw] md:min-w-[280px] w-[80vw] md:w-[280px] h-[200px] rounded-2xl relative overflow-hidden flex-shrink-0 shadow-md active:scale-[0.98] transition-transform bg-gray-200 dark:bg-gray-700"
                    >
                        <img src={article.imageUrl} alt="" className="w-full h-full object-cover absolute inset-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 flex flex-col justify-end">
                            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">{article.tags[0]}</span>
                            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-sm">{article.headline}</h3>
                            <div className="flex items-center gap-4 text-white/90 text-xs font-medium mt-3">
                                <span className="flex items-center gap-1.5"><FaRegHeart /> {article.upvotes}</span>
                                <span className="flex items-center gap-1.5"><FaRegCommentDots /> {article.reviews}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Vertical Feed (Recent) */}
        <div className="px-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Novidades</h2>
                <button onClick={() => navigate('/articles')} className="text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center gap-1 p-2 -mr-2 active:bg-purple-50 dark:active:bg-purple-900/20 rounded-lg">Ver tudo <FaArrowRight size={10}/></button>
            </div>

            <div className="space-y-4">
                {recent.map((article) => (
                    <div 
                    key={article._id} 
                    onClick={() => navigate(`/articles/${article._id}`)}
                    className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 active:bg-gray-50 dark:active:bg-gray-700 transition-colors cursor-pointer"
                    >
                        <img src={article.imageUrl} alt="" className="w-24 h-24 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
                        <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                            <div>
                                <span className="text-[10px] md:text-xs text-purple-700 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-900/40 px-2 py-0.5 rounded-md inline-block mb-1.5">{article.tags[0]}</span>
                                <h3 className="font-bold text-gray-800 dark:text-white text-sm md:text-base leading-snug line-clamp-2">{article.headline}</h3>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-2">
                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">Ler</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </Layout>
  );
}

export default Home;