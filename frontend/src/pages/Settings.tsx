import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { authService } from "../services/api";
import { FaArrowLeft, FaSave, FaUser, FaBuilding, FaMoon, FaSun, FaImage, FaPlus, FaTimes, FaBook } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Settings() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    institution: user?.institution || "",
    avatar: user?.avatar || "",
  });

  const [subjects, setSubjects] = useState<string[]>(user?.subjects || []);
  const [newSubject, setNewSubject] = useState("");

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        ...formData,
        subjects // Will be ignored by backend if role is not professor, but good to send
      };

      const res = await authService.updateProfile(payload);
      if (res.success) {
          updateUser(res.data); // Update global context
          alert("Perfil atualizado com sucesso!");
      }
    } catch (error) {
      alert("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const isProfessor = user?.role === 'professor';

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 min-h-screen relative shadow-2xl flex flex-col transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
          <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-300 p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700">
            <FaArrowLeft />
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">Configurações</h1>
        </div>

        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isDark ? 'bg-gray-700 text-yellow-400' : 'bg-blue-50 text-blue-600'}`}>
                    {isDark ? <FaMoon size={16} /> : <FaSun size={16} />}
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">Modo Escuro</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ajustar aparência do app</p>
                </div>
            </div>
            <button 
                onClick={toggleTheme}
                className={`w-12 h-7 rounded-full p-1 transition-all duration-300 ease-in-out ${isDark ? 'bg-purple-600' : 'bg-gray-300'}`}
            >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <img src={formData.avatar || user?.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-100 dark:border-gray-700 object-cover" />
              <div className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full border-2 border-white dark:border-gray-800">
                 <FaPen size={10} />
              </div>
            </div>
          </div>

          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Nome Completo"
              className="w-full bg-gray-50 dark:bg-gray-700 pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white font-medium"
            />
            <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1 text-xs font-bold text-purple-600">Nome</label>
          </div>

          <div className="relative">
            <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={formData.institution}
              onChange={(e) => setFormData({...formData, institution: e.target.value})}
              placeholder="Instituição"
              className="w-full bg-gray-50 dark:bg-gray-700 pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white font-medium"
            />
            <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1 text-xs font-bold text-purple-600">Instituição</label>
          </div>

          <div className="relative">
            <FaImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={formData.avatar}
              onChange={(e) => setFormData({...formData, avatar: e.target.value})}
              placeholder="URL do Avatar"
              className="w-full bg-gray-50 dark:bg-gray-700 pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white font-medium"
            />
            <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1 text-xs font-bold text-purple-600">URL da Imagem</label>
          </div>

          {isProfessor && (
             <div className="pt-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                   <FaBook className="text-purple-600"/> Disciplinas
                </label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                   {subjects.map((subj, index) => (
                      <span key={index} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                         {subj}
                         <button 
                            type="button" 
                            onClick={() => handleRemoveSubject(index)}
                            className="hover:text-red-500 focus:outline-none"
                         >
                            <FaTimes size={12}/>
                         </button>
                      </span>
                   ))}
                </div>

                <div className="flex gap-2">
                   <input
                     value={newSubject}
                     onChange={(e) => setNewSubject(e.target.value)}
                     placeholder="Adicionar matéria..."
                     className="flex-1 bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-sm"
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         e.preventDefault();
                         handleAddSubject();
                       }
                     }}
                   />
                   <button 
                     type="button"
                     onClick={handleAddSubject}
                     className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white p-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                   >
                      <FaPlus />
                   </button>
                </div>
             </div>
          )}

          <div className="pt-4 pb-8">
             <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {loading ? "Salvando..." : (
                <>
                  <FaSave /> Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const FaPen = ({size}: {size:number}) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height={size} width={size} xmlns="http://www.w3.org/2000/svg"><path d="M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C2.59 513.61-6.36 504.66 4.98 480.94l12.61-114.15 273.15-273.55zm-55.99 55.99l-254.7 254.7L0 480l76.04-20.05 254.7-254.7-95.99-96.02zM459.7 13.79l38.51 38.51c18.33 18.33 18.33 48.06 0 66.39l-61.43 61.43-128.02-128.02 61.43-61.43c18.33-18.33 48.06-18.33 66.39 0z"></path></svg>
);

export default Settings;