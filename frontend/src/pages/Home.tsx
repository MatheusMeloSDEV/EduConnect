import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
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
    articleService.getPopularArticles().then(res => setPopular(res.data));
    articleService.getArticles().then(res => setRecent(res.data.slice(0, 5)));
  }, []);

  const isProfessor = user?.role === 'professor';

  return (
    <Layout>
      <div className={`bg-gradient-to-r ${isProfessor ? 'from-indigo-800 to-purple-800' : 'from-purple-700 to-purple-600'} p-6 md:p-12 md:rounded-2xl shadow-sm relative overflow-hidden mb-6 md:min-h-[200px] flex flex-col justify-end transition-colors`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10 flex flex-row items-center justify-between gap-4 mt-12 md:mt-0">
          <div className="flex items-center gap-4">
            <img src={user?.avatar} alt="Avatar" className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 border-white/30 shadow-md object-cover" />
            <div>
              <p className="text-purple-200 text-xs font-medium uppercase tracking-wider mb-0.5">{isProfessor ? 'Professor(a)' : 'Aluno(a)'}</p>
              <h1 className="text-white font-bold text-xl md:text-3xl leading-none">{isProfessor ? `Olá, Prof. ${user?.fullName.split(' ')[0]}` : `Olá, ${user?.fullName.split(' ')[0]}`}</h1>
              <p className="text-white/80 text-xs md:text-sm mt-1 hidden md:block">{isProfessor ? 'Pronto para inspirar seus alunos hoje?' : 'Vamos aprender algo novo hoje?'}</p>
            </div>
          </div>
          <button onClick={() => navigate(isProfessor ? '/articles/create' : '/articles')} className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2">
             {isProfessor ? <><FaPlus /> Criar Artigo</> : 'Explorar'}
          </button>
        </div>
      </div>

      <div className="pb-10 transition-colors">
        <div className="mb-8">
            <div className="flex items-center justify-between px-6 mb-4">
                <div className="flex items-center gap-2">
                    <FaFire className="text-orange-500" />
                    <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Em Alta</h2>
                </div>
            </div>
            <div className="smooth-scroll-x flex overflow-x-auto pb-4 px-6 gap-5 no-scrollbar snap-x snap-mandatory scroll-pl-6">
                {popular.map((article) => (
                    <div key={article._id} onClick={() => navigate(`/articles/${article._id}`)} className="snap-start min-w-[80vw] md:min-w-[280px] w-[80vw] md:w-[280px] h-[200px] rounded-2xl relative overflow-hidden flex-shrink-0 shadow-md active:scale-[0.98] transition-transform bg-gray-200 dark:bg-gray-800">
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

        <div className="px-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Novidades</h2>
                <button onClick={() => navigate('/articles')} className="text-purple-600 dark:text-purple-400 text-sm font-bold flex items-center gap-1">Ver tudo <FaArrowRight size={12} /></button>
            </div>
            <div className="space-y-4">
                {recent.map(article => (
                    <div key={article._id} onClick={() => navigate(`/articles/${article._id}`)} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 active:scale-[0.99] transition-all cursor-pointer">
                        <img src={article.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex flex-col justify-center">
                            <h3 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-2">{article.headline}</h3>
                            <p className="text-gray-400 text-[10px] mt-1 uppercase font-bold tracking-wider">{article.tags[0]}</p>
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