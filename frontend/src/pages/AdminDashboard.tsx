
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { User, Article } from "../types";
import { authService, articleService } from "../services/api";
import { FaUserTie, FaUserGraduate, FaNewspaper, FaTrash, FaEdit, FaPlus, FaSearch } from "react-icons/fa";

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'professors' | 'students'>('posts');
  const [loading, setLoading] = useState(false);
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user && user.role !== 'professor') {
        navigate('/home');
        return;
    }
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
        if (activeTab === 'posts') {
            const res = await articleService.getArticles();
            setArticles(res.data);
        } else {
            const role = activeTab === 'professors' ? 'professor' : 'aluno';
            const res = await authService.getAllUsers(role);
            setUsers(res.data);
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este artigo?")) {
        await articleService.deleteArticle(id);
        fetchData();
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
        await authService.deleteUser(id);
        fetchData();
    }
  };

  const filteredArticles = articles.filter(a => a.headline.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredUsers = users.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Painel Administrativo</h1>
        
        {/* Abas */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
            <TabButton 
                active={activeTab === 'posts'} 
                onClick={() => setActiveTab('posts')} 
                icon={FaNewspaper} 
                label="Postagens" 
            />
            <TabButton 
                active={activeTab === 'professors'} 
                onClick={() => setActiveTab('professors')} 
                icon={FaUserTie} 
                label="Professores" 
            />
            <TabButton 
                active={activeTab === 'students'} 
                onClick={() => setActiveTab('students')} 
                icon={FaUserGraduate} 
                label="Estudantes" 
            />
        </div>

        {/* Barra de Busca e Ação */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="relative w-full md:w-auto flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text"
                    placeholder={`Buscar ${activeTab === 'posts' ? 'postagens' : 'usuários'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                />
            </div>
            
            {activeTab !== 'posts' && (
                <button 
                    onClick={() => navigate(`/admin/users/create?role=${activeTab === 'professors' ? 'professor' : 'aluno'}`)}
                    className="w-full md:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition"
                >
                    <FaPlus /> Adicionar {activeTab === 'professors' ? 'Professor' : 'Estudante'}
                </button>
            )}
        </div>

        {/* Área de Conteúdo */}
        {loading ? (
            <div className="text-center py-10 text-gray-500">Carregando dados...</div>
        ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {activeTab === 'posts' ? (
                    // Lista de Postagens
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredArticles.length === 0 && <div className="p-6 text-center text-gray-500">Nenhum post encontrado.</div>}
                        {filteredArticles.map(article => (
                            <div key={article._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <img src={article.imageUrl} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-gray-800 dark:text-white truncate">{article.headline}</h3>
                                        <p className="text-xs text-gray-500">Por: {article.writer?.fullName || 'Desconhecido'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-2">
                                    <button onClick={() => navigate(`/articles/edit/${article._id}`)} className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDeleteArticle(article._id)} className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Lista de Usuários
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredUsers.length === 0 && <div className="p-6 text-center text-gray-500">Nenhum usuário encontrado.</div>}
                        {filteredUsers.map(u => (
                            <div key={u._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                <div className="flex items-center gap-4">
                                    <img src={u.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-white">{u.fullName}</h3>
                                        <p className="text-xs text-gray-500">{u.institution}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-2">
                                    <button onClick={() => navigate(`/admin/users/edit/${u._id}`)} className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </Layout>
  );
}

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
            active 
            ? "bg-purple-600 text-white shadow-md" 
            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
        }`}
    >
        <Icon /> {label}
    </button>
);

export default AdminDashboard;
