
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { authService } from "../services/api";
import { FaArrowLeft, FaSave, FaUser, FaEnvelope, FaLock, FaBuilding, FaIdCard, FaUsers, FaBook, FaImage } from "react-icons/fa";

function AdminUserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const roleQuery = searchParams.get('role');
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Padrão para parâmetro de role ou padrão para aluno
  const [role, setRole] = useState<"aluno" | "professor">(roleQuery === 'professor' ? 'professor' : 'aluno');

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    institution: "",
    age: "",
    avatar: "",
    guardianName: "",
    group: "",
    subjects: ""
  });

  useEffect(() => {
    if (id) {
        setIsEditing(true);
        setLoading(true);
        authService.getUserById(id).then(res => {
            const u = res.data;
            setRole(u.role);
            setFormData({
                fullName: u.fullName,
                email: u.email,
                password: "", // Manter vazio na edição, a menos que altere
                institution: u.institution || "",
                age: u.age?.toString() || "",
                avatar: u.avatar || "",
                guardianName: u.guardianName || "",
                group: u.group || "",
                subjects: u.subjects?.join(', ') || ""
            });
        }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        institution: formData.institution,
        age: parseInt(formData.age),
        role: role,
        avatar: formData.avatar || `https://ui-avatars.com/api/?name=${formData.fullName}&background=random`
      };

      if (formData.password) {
          payload.password = formData.password;
      }

      if (role === "aluno") {
        payload.guardianName = formData.guardianName;
        payload.group = formData.group;
      } else {
        payload.subjects = formData.subjects.split(',').map(s => s.trim()).filter(s => s);
      }

      if (isEditing && id) {
          await authService.updateUserByAdmin(id, payload);
          alert("Usuário atualizado!");
      } else {
          // Novo usuário precisa de senha
          if(!formData.password) {
              alert("Senha é obrigatória para novos usuários");
              setLoading(false);
              return;
          }
          await authService.createUserByAdmin(payload);
          alert("Usuário criado!");
      }
      navigate('/admin');
    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-gray-50 dark:bg-gray-700 pl-12 pr-4 py-3 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none font-medium border border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all";

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/admin')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isEditing ? "Editar Usuário" : `Novo ${role === 'professor' ? 'Professor' : 'Estudante'}`}
            </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto">
            {/* Alternador de Papel (Apenas na Criação) */}
            {!isEditing && (
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-6">
                    <button 
                        type="button"
                        onClick={() => setRole("aluno")}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${role === "aluno" ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm" : "text-gray-400 dark:text-gray-400"}`}
                    >
                        Aluno
                    </button>
                    <button 
                        type="button"
                        onClick={() => setRole("professor")}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${role === "professor" ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm" : "text-gray-400 dark:text-gray-400"}`}
                    >
                        Professor
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nome Completo" className={inputClasses} required />
                    </div>
                    <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className={inputClasses} required />
                    </div>
                </div>

                <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? "Senha (deixe em branco para manter)" : "Senha"} className={inputClasses} required={!isEditing} />
                </div>
                
                <div className="relative">
                    <FaImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="avatar" value={formData.avatar} onChange={handleChange} placeholder="URL do Avatar (Opcional)" className={inputClasses} />
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input name="institution" value={formData.institution} onChange={handleChange} placeholder="Escola/Instituição" className={inputClasses} required />
                    </div>
                    <div className="relative w-1/3">
                        <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Idade" className={inputClasses} required />
                    </div>
                </div>

                {/* Campos Específicos */}
                {role === "aluno" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input name="guardianName" value={formData.guardianName} onChange={handleChange} placeholder="Nome do Responsável" className={inputClasses} required />
                        </div>
                        <div className="relative">
                            <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input name="group" value={formData.group} onChange={handleChange} placeholder="Turma (ex: 3A)" className={inputClasses} required />
                        </div>
                    </div>
                ) : (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <FaBook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input name="subjects" value={formData.subjects} onChange={handleChange} placeholder="Matérias (sep. por vírgula)" className={inputClasses} required />
                        </div>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg mt-6 active:scale-95 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                >
                    <FaSave /> {loading ? "Salvando..." : (isEditing ? "Atualizar Usuário" : "Criar Usuário")}
                </button>
            </form>
        </div>
      </div>
    </Layout>
  );
}

export default AdminUserForm;
