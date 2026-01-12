import React from "react";
import Layout from "../components/Layout";
import useAuth from "../hooks/useAuth";
import { FaCog, FaBook, FaSignOutAlt, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
          <button onClick={() => navigate('/profile/settings')} className="text-gray-400 p-2 rounded-full active:bg-gray-100"><FaCog size={20} /></button>
        </div>

        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <img src={user.avatar} alt="" className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" />
            <div className="absolute bottom-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white uppercase">
              {user.role}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mt-4">{user.fullName}</h2>
          <p className="text-gray-500 text-sm">{user.institution}</p>
        </div>

        <div className="space-y-4">
          <div 
            onClick={() => navigate('/profile/articles')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                <FaBook />
              </div>
              <div>
                <p className="font-bold text-gray-800">Meus Artigos</p>
                <p className="text-xs text-gray-400">Gerenciar publicações</p>
              </div>
            </div>
            <FaChevronRight className="text-gray-300" />
          </div>

          <button 
            onClick={handleLogout}
            className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between text-red-500 active:scale-[0.98] transition"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-50 p-3 rounded-xl">
                <FaSignOutAlt />
              </div>
              <p className="font-bold">Sair da conta</p>
            </div>
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;