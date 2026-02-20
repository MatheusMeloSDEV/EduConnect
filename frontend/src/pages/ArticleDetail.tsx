import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Article, Comment } from "../types";
import { certificateService, articleService, commentService } from "../services/api";
import { FaArrowLeft, FaHeart, FaRegHeart, FaPaperPlane, FaPen, FaCheckCircle, FaAward, FaShieldAlt, FaTimes, FaDownload } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import html2canvas from "html2canvas";

function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Ref para o certificado (usado para o Download)
  const certificateRef = useRef<HTMLDivElement>(null);

  // Estados do Artigo e Comentários
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  // Estados do Certificado
  const [completed, setCompleted] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [authHash, setAuthHash] = useState(""); // Vem do banco de dados agora!

  useEffect(() => {
    if (id) {
      articleService.getArticleById(id).then(res => {
          setArticle(res.data);
          setLiked(!!res.data.userUpvoted);
      });
      commentService.getCommentsByArticle(id).then(res => setComments(res.data));
      
      if (user?.role === 'aluno') {
        certificateService.checkCompletion(id)
          .then(res => {
            // Um truque para funcionar tanto no backend novo quanto no antigo!
            const responseData = res.data || (res as any);
            
            if (responseData && responseData.completed) {
              setCompleted(true);
              setAuthHash(responseData.certificate?.authHash);
            }
          })
          .catch(error => {
            console.error("⚠️ Aviso: Não foi possível verificar o certificado agora.", error);
            // A tela não quebra! O aluno apenas verá o botão de concluir normalmente.
          });
      }
    }
  }, [id, user]);

  // ✅ ÚNICA FUNÇÃO HANDLE COMPLETE (Salva no Banco)
  const handleComplete = async () => {
    if (!id) return;
    try {
      const res = await certificateService.markAsCompleted(id);
      setCompleted(true);
      setAuthHash(res.data.certificate.authHash);
      setShowCertificate(true);
    } catch (error) {
      alert("Erro ao gerar certificado. Tente novamente.");
    }
  };

  const handleLike = () => {
    if (!article || !id) return;
    articleService.toggleUpvote(id).then(res => {
        setLiked(res.data.upvoted);
        setArticle({ ...article, upvotes: res.data.upvotes, userUpvoted: res.data.upvoted });
    });
  };

  const handleCommentLike = async (commentId: string) => {
    try {
        const res = await commentService.toggleCommentLike(commentId);
        setComments(prevComments => prevComments.map(c => {
            if (c._id === commentId) {
                return { ...c, upvotes: res.data.upvotes, userLiked: res.data.liked };
            }
            return c;
        }))
    } catch (error) {
        console.error("Erro ao curtir comentário:", error);
    }
  };

  const handleSendComment = async () => {
    if(!commentText.trim() || !id) return;
    const res = await commentService.createComment({ message: commentText, articleId: id });
    setComments([res.data, ...comments]);
    setCommentText("");
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
    } else {
        navigate('/articles');
    }
  };

  // Função para Baixar Certificado
  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current, { 
        scale: 2, 
        backgroundColor: null,
        useCORS: true // Essencial para imagens externas
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Certificado-EDUConnect-${user?.fullName.split(' ')[0] || 'Aluno'}.png`;
      link.click();
    } catch (error) {
      console.error("Erro ao baixar o certificado", error);
      alert("Houve um erro ao gerar a imagem do certificado.");
    }
  };

  if (!article) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Carregando conteúdo...</div>;

  const isAuthor = user && article.writer && (typeof article.writer === 'object' ? article.writer._id === user._id : article.writer === user._id);

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 dark:bg-gray-900 pb-20 md:pb-10 transition-colors duration-300">
      
      <div className="w-full md:max-w-5xl mx-auto bg-white dark:bg-gray-900 md:shadow-sm md:rounded-b-2xl md:min-h-screen transition-colors duration-300 relative">
        
        {/* Cabeçalho */}
        <div className="relative h-72 md:h-[500px] w-full group">
          <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-40 opacity-80" />
          
          <button 
            onClick={handleBack} 
            className="absolute top-6 left-6 text-white p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 transition flex items-center gap-2 pr-4"
          >
            <FaArrowLeft size={16} /> <span className="text-sm font-bold hidden md:inline">Voltar</span>
          </button>

          {isAuthor && (
            <button 
              onClick={() => navigate(`/articles/edit/${article._id}`)}
              className="absolute top-6 right-6 text-white p-2 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg transition flex items-center gap-2 pr-4"
            >
              <FaPen size={14} /> <span className="text-sm font-bold hidden md:inline">Editar</span>
            </button>
          )}
        </div>

        {/* Corpo do Conteúdo */}
        <div className="px-6 md:px-20 py-8 md:py-16">
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
              {article.tags?.[0] || 'Geral'}
            </span>
            <span className="text-gray-400 text-sm">
              {new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight tracking-tight">{article.headline}</h1>

          <div className="flex items-center justify-between border-y border-gray-100 dark:border-gray-800 py-6 mb-10">
            <div className="flex items-center gap-4">
               <img src={article.writer?.avatar || "https://ui-avatars.com/api/?name=Unknown"} className="w-12 h-12 rounded-full ring-2 ring-gray-100 dark:ring-gray-700" />
               <div>
                 <p className="font-bold text-gray-900 dark:text-white text-base">{article.writer?.fullName || "Autor Desconhecido"}</p>
                 <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    {article.writer ? `${article.writer.role} • ${article.writer.institution}` : 'Instituição Desconhecida'}
                 </p>
               </div>
            </div>
            
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${
                  liked 
                  ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {liked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
              <span className="font-bold text-sm">{liked ? 'Curtido' : 'Curtir'} {article.upvotes > 0 ? `(${article.upvotes})` : ''}</span>
            </button>
          </div>

          <div className="prose prose-lg md:prose-xl prose-purple dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-serif md:font-sans mb-16">
            <p className="whitespace-pre-wrap">{article.body}</p>
          </div>

          {/* Seção de Conclusão / Certificado */}
          <div className="mb-16">
            {!completed ? (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-8 rounded-[2rem] border-2 border-dashed border-purple-200 dark:border-purple-800 text-center">
                    <FaAward className="mx-auto text-purple-400 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Terminou de estudar?</h3>
                    <p className="text-gray-500 mb-6">Conclua este material para gerar seu certificado de participação.</p>
                    <button 
                        onClick={handleComplete}
                        className="bg-purple-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                        <FaCheckCircle /> Concluir e Gerar Certificado
                    </button>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 text-green-700 dark:text-green-400">
                    <div className="flex items-center gap-3">
                        <FaCheckCircle size={24} />
                        <span className="font-bold">Conteúdo Concluído!</span>
                    </div>
                    <button onClick={() => setShowCertificate(true)} className="text-sm font-black underline uppercase tracking-widest hover:text-green-800 dark:hover:text-green-300 transition-colors">
                        Ver Certificado
                    </button>
                </div>
            )}
          </div>

          {/* Seção de Comentários */}
          <div className="pt-10 border-t border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                Comentários <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm px-2.5 py-0.5 rounded-full font-medium">{comments.length}</span>
            </h3>
            
            <div className="flex gap-4 items-start mb-10">
                <img 
                  src={user?.avatar || "https://ui-avatars.com/api/?name=User"} 
                  className="w-10 h-10 rounded-full flex-shrink-0 object-cover border border-gray-200 dark:border-gray-700" 
                  alt="Meu Avatar"
                />
                <div className="flex-1 relative">
                    <textarea 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Escreva um comentário sobre a aula..." 
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-y"
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

            <div className="space-y-6">
              {comments.map(c => (
                <div key={c._id} className="flex gap-4">
                  <img src={c.reviewer?.avatar || "https://ui-avatars.com/api/?name=Unknown"} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                  <div>
                    <div className="bg-gray-50 dark:bg-gray-800 px-5 py-3 rounded-2xl rounded-tl-none">
                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{c.reviewer?.fullName || "Anônimo"}</p>
                        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{c.message}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-2 text-xs font-medium text-gray-500 dark:text-gray-500">
                        <button 
                            onClick={() => handleCommentLike(c._id)}
                            className={`flex items-center gap-1 transition-colors ${c.userLiked ? 'text-purple-600 dark:text-purple-400' : 'hover:text-purple-600 dark:hover:text-purple-400'}`}
                        >
                             {c.userLiked ? <FaHeart /> : <FaRegHeart />} 
                             {c.upvotes > 0 ? `${c.upvotes} Curtir` : 'Curtir'}
                        </button>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Certificado */}
      {showCertificate && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
              
              {/* Botões de Ação - Colocados FORA da área do certificado */}
              <div className="w-full max-w-3xl flex justify-end gap-4 mb-4">
                  <button 
                    onClick={handleDownloadCertificate} 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg"
                  >
                      <FaDownload /> Baixar PDF/Imagem
                  </button>
                  <button 
                    onClick={() => setShowCertificate(false)} 
                    className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors backdrop-blur-md"
                  >
                      <FaTimes /> Fechar
                  </button>
              </div>

              {/* Área do Certificado (Apenas isso será baixado) */}
              <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-[2rem] p-1 shadow-2xl overflow-hidden">
                <div ref={certificateRef} className="border-[12px] border-double border-purple-600/20 rounded-[1.8rem] p-6 md:p-10 relative bg-white dark:bg-gray-900">
                    
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <FaAward style={{ width: '80px', height: '80px', color: '#9333ea' }} />
                        </div>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-purple-600 mb-8">Certificado de Conclusão</h2>
                        
                        <p className="text-gray-500 dark:text-gray-400 font-serif italic mb-2">Certificamos que o aluno(a)</p>
                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-10 decoration-purple-600 decoration-4 underline-offset-8 underline">
                            {user?.fullName}
                        </h3>
                        
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-12">
                            Concluiu com êxito o estudo do material pedagógico <strong className="text-gray-900 dark:text-white">"{article.headline}"</strong>, lecionado por <strong>{article.writer?.fullName}</strong> na plataforma EDUConnect em {new Date().toLocaleDateString()}.
                        </p>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-10 border-t border-gray-100 dark:border-gray-800">
                            <div className="text-left">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Assinatura Digital</p>
                                <p className="font-mono text-[10px] text-purple-500 font-bold">{authHash}</p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <FaShieldAlt style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                                <span className="text-[9px] font-bold uppercase">Autenticado via EDUConnect</span>
                            </div>
                            <div className="text-center">
                                <div className="h-0.5 w-32 bg-gray-200 mb-2"></div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">{article.writer?.fullName}</p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
          </div>
      )}
    </div>
  );
}

export default ArticleDetail;