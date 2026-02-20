import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext"; // Importação corrigida!
import { articleService, aiService } from "../services/api";
import { FaArrowLeft, FaCheck, FaImage, FaMagic, FaRobot } from "react-icons/fa";

function CreateArticle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados da IA
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    headline: "",
    summary: "",
    body: "",
    tags: "",
    imageUrl: ""
  });

  useEffect(() => {
    document.title = id ? "Editar Artigo | EDUConnect" : "Novo Artigo | EDUConnect";

    if (user && user.role !== 'professor') {
      alert("Apenas professores podem criar artigos.");
      navigate('/home');
      return;
    }

    if (id) {
      setIsEditing(true);
      setLoading(true);
      articleService.getArticleById(id)
        .then(res => {
          const article = res.data;
          setFormData({
            headline: article.headline,
            summary: article.summary,
            body: article.body,
            tags: article.tags.join(', '),
            imageUrl: article.imageUrl
          });
        })
        .catch(err => {
          alert("Erro ao carregar artigo para edição.");
          navigate('/articles');
        })
        .finally(() => setLoading(false));
    }
  }, [user, navigate, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBack = () => {
      if (isEditing && id) {
          navigate(`/articles/${id}`);
      } else {
          navigate('/articles');
      }
  };

  // Função nova da IA
  const handleGetAiSuggestions = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evita dar submit no formulário sem querer
    if (!formData.headline || formData.body.length < 20) {
      alert("Escreva o título e um pouco do conteúdo primeiro para que a IA possa analisar.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await aiService.getSuggestions(formData.headline, formData.body);
      setSuggestions(res.data);
    } catch (error) {
      alert("Erro ao contatar o assistente de IA.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(t => t.length > 0);
      const payload = {
        headline: formData.headline,
        summary: formData.summary,
        body: formData.body,
        imageUrl: formData.imageUrl || "https://picsum.photos/seed/default/800/600",
        tags: tagsArray.length > 0 ? tagsArray : ["Geral"]
      };

      let targetId = id;

      if (isEditing && id) {
        await articleService.updateArticle(id, payload);
      } else {
        const res = await articleService.createArticle(payload, user);
        targetId = res.data._id;
      }

      navigate(`/articles/${targetId}`, { replace: true });
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar artigo.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'professor') return null;

  return (
    <Layout>
      <div className="p-6 md:flex gap-8 max-w-7xl mx-auto">
        
        {/* Lado Esquerdo: Formulário */}
        <div className="flex-1">
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={handleBack} 
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                    <FaArrowLeft />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {isEditing ? "Editar Artigo" : "Novo Artigo"}
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Título */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Título</label>
                    <input
                      name="headline"
                      value={formData.headline}
                      onChange={handleChange}
                      placeholder="Ex: Introdução ao Python"
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                      required
                    />
                  </div>

                  {/* URL da Imagem */}
                  <div>
                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">URL da Imagem de Capa</label>
                     <div className="relative">
                        <FaImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleChange}
                          placeholder="https://..."
                          className="w-full bg-gray-50 dark:bg-gray-700 pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                     </div>
                  </div>

                  {/* Resumo */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Resumo</label>
                    <textarea
                      name="summary"
                      value={formData.summary}
                      onChange={handleChange}
                      placeholder="Uma breve descrição do conteúdo..."
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                      required
                    />
                  </div>

                  {/* Conteúdo */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Conteúdo Pedagógico</label>
                    <textarea
                      name="body"
                      value={formData.body}
                      onChange={handleChange}
                      placeholder="Escreva seu artigo aqui..."
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-64 resize-none"
                      required
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Tags (Separadas por vírgula)</label>
                    <input
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="Ex: Programação, Tech, Dicas"
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Botão de Envio */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70"
                    >
                      {loading ? "Carregando..." : (
                        <>
                          <FaCheck /> {isEditing ? "Salvar Alterações" : "Publicar Artigo"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
            </div>
        </div>

        {/* Lado Direito: Sidebar IA */}
        <div className="w-full md:w-80 mt-8 md:mt-0">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                    <FaRobot className="animate-bounce" />
                    <h3 className="font-bold">Assistente IA</h3>
                </div>
                <p className="text-xs text-purple-100 mb-6">Analiso seu texto e sugiro materiais extras e questões para seus alunos.</p>
                
                <button 
                    onClick={handleGetAiSuggestions}
                    disabled={aiLoading}
                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {aiLoading ? "Analisando..." : <><FaMagic /> Sugerir Materiais</>}
                </button>

                {suggestions && (
                    <div className="mt-6 p-4 bg-white/10 rounded-xl text-sm leading-relaxed animate-fade-in whitespace-pre-wrap shadow-inner overflow-y-auto max-h-[50vh] select-text">
                        {suggestions}
                    </div>
                )}
            </div>
        </div>
        
      </div>
    </Layout>
  );
}

export default CreateArticle;