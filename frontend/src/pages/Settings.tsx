import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { authService } from "../services/api";
import { FaArrowLeft, FaSave, FaUser, FaBuilding } from "react-icons/fa";

function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Assume updateAuthUser exists or we just rely on API updates for demo
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    institution: user?.institution || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app we would update the context too
      await authService.updateProfile(formData);
      alert("Perfil atualizado com sucesso!");
      // Force reload or update context logic would go here
      // For now, we assume the API mock update persists in memory
    } catch (error) {
      alert("Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl flex flex-col">
        <div className="bg-white px-6 py-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-20">
          <button onClick={() => navigate(-1)} className="text-gray-600 p-2 -ml-2 rounded-full active:bg-gray-100">
            <FaArrowLeft />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Configurações</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img src={user?.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-100" />
              <div className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full border-2 border-white">
                 <FaPen size={10} /> {/* We won't implement file upload for this demo */}
              </div>
            </div>
          </div>

          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Nome Completo"
              className="w-full bg-gray-50 pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-gray-800 font-medium"
            />
            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-purple-600">Nome</label>
          </div>

          <div className="relative">
            <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={formData.institution}
              onChange={(e) => setFormData({...formData, institution: e.target.value})}
              placeholder="Instituição"
              className="w-full bg-gray-50 pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-gray-800 font-medium"
            />
            <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-purple-600">Instituição</label>
          </div>

          <div className="pt-4">
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

// Helper icon
const FaPen = ({size}: {size:number}) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height={size} width={size} xmlns="http://www.w3.org/2000/svg"><path d="M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C2.59 513.61-6.36 504.66 4.98 480.94l12.61-114.15 273.15-273.55zm-55.99 55.99l-254.7 254.7L0 480l76.04-20.05 254.7-254.7-95.99-96.02zM459.7 13.79l38.51 38.51c18.33 18.33 18.33 48.06 0 66.39l-61.43 61.43-128.02-128.02 61.43-61.43c18.33-18.33 48.06-18.33 66.39 0z"></path></svg>
);

export default Settings;