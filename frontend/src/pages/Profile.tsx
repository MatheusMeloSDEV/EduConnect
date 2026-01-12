import React from "react";
import Layout from "../components/Layout";
import useAuth from "../hooks/useAuth";
import { FaCog, FaBook, FaSignOutAlt, FaChevronRight, FaUsers, FaIdCard, FaChalkboardTeacher } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  const isProfessor = user.role === 'professor';

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Meu Perfil</h1>
          <button onClick={() => navigate('/profile/settings')} className="text-gray-400 p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"><FaCog size={20} /></button>
        </div>

        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <img src={user.avatar} alt="" className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover" />
            <div className="absolute bottom-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white dark:border-gray-800 uppercase">
              {user.role}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mt-4">{user.fullName}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{user.institution}</p>
        </div>

        {/* Role Specific Info Box */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-5 mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
           <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-sm uppercase tracking-wider opacity-70">
              {isProfessor ? 'Informações Acadêmicas' : 'Dados do Aluno'}
           </h3>
           
           <div className="space-y-4">
              {isProfessor ? (
                <div className="flex items-center gap-3">
                   <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                      <FaChalkboardTeacher />
                   </div>
                   <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Disciplinas</p>
                      <p className="font-medium text-gray-800 dark:text-white">
                         {user.subjects && user.subjects.length > 0 ? user.subjects.join(', ') : 'Geral'}
                      </p>
                   </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                        <FaUsers />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Turma</p>
                        <p className="font-medium text-gray-800 dark:text-white">{user.group || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-green-600 dark:text-green-400">
                        <FaIdCard />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Responsável</p>
                        <p className="font-medium text-gray-800 dark:text-white">{user.guardianName || 'N/A'}</p>
                    </div>
                  </div>
                </>
              )}
           </div>
        </div>

        <div className="space-y-4">
          <div 
            onClick={() => navigate('/profile/articles')}
            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between active:scale-[0.98] transition cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl text-purple-600 dark:text-purple-400">
                <FaBook />
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-white">Meus Artigos</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Gerenciar publicações</p>
              </div>
            </div>
            <FaChevronRight className="text-gray-300 dark:text-gray-600" />
          </div>

          <button 
            onClick={handleLogout}
            className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between text-red-500 active:scale-[0.98] transition"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
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