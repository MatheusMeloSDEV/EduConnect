import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import useAuth from "../hooks/useAuth";
import { articleService } from "../services/api";
import { FaArrowLeft, FaCheck, FaImage } from "react-icons/fa";

function CreateArticle() {
  const navigate = useNavigate();
  const { id } = useParams(); // Check if we are in edit mode
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    headline: "",
    summary: "",
    body: "",
    tags: "",
    imageUrl: ""
  });

  useEffect(() => {
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
     // Explicitly navigate based on context to avoid getting stuck
     if (isEditing && id) {
         navigate(`/articles/${id}`);
     } else {
         navigate('/articles');
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

      // Use replace: true to prevent the history stack from growing with the 'Edit' page
      // This ensures 'Back' from the Detail page goes to the List, not back to Edit.
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
    <div className="flex justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 min-h-screen relative shadow-2xl flex flex-col">
        <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
          <button 
            type="button" 
            onClick={handleBack} 
            className="text-gray-600 dark:text-gray-300 p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">{isEditing ? "Editar Artigo" : "Novo Artigo"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
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

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Conteúdo</label>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              placeholder="Escreva seu artigo aqui..."
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-64 resize-none"
              required
            />
          </div>

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

          <div className="pb-8">
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
  );
}

export default CreateArticle;