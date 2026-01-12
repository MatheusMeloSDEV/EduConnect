import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { authService } from "../services/api";
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaArrowLeft, FaIdCard, FaUsers, FaBook } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"aluno" | "professor">("aluno");
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    institution: "",
    age: "",
    guardianName: "", // For student
    group: "",       // For student
    subjects: ""     // For professor (comma separated)
  });

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
        password: formData.password,
        institution: formData.institution,
        age: parseInt(formData.age),
        role: role,
        avatar: `https://ui-avatars.com/api/?name=${formData.fullName}&background=random`
      };

      if (role === "aluno") {
        payload.guardianName = formData.guardianName;
        payload.group = formData.group;
      } else {
        payload.subjects = formData.subjects.split(',').map(s => s.trim()).filter(s => s);
      }

      await authService.register(payload);
      alert("Conta criada com sucesso! Faça login para continuar.");
      navigate("/");
    } catch (error: any) {
      alert("Erro ao cadastrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-gray-50 dark:bg-gray-700 pl-12 pr-4 py-3 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none font-medium border border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all";

  return (
    <Layout hideNav>
      <div className="flex-1 flex flex-col md:flex-row h-full">
         
         {/* Desktop Side Panel */}
         <div className="hidden md:flex w-5/12 bg-purple-600 items-center justify-center p-12 text-white relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop')] bg-cover opacity-20 mix-blend-overlay"></div>
             <div className="relative z-10">
                 <h1 className="text-4xl font-bold mb-4">Bem-vindo a bordo!</h1>
                 <p className="text-purple-100 text-lg">Crie sua conta e comece a aprender com a melhor comunidade de ensino.</p>
             </div>
         </div>

         {/* Form Section */}
         <div className="flex-1 bg-gray-50 dark:bg-gray-900 md:bg-white dark:md:bg-gray-900 relative overflow-y-auto transition-colors duration-300">
            {/* Header Mobile Only */}
            <div className="bg-purple-600 px-8 pt-6 pb-20 rounded-b-[3rem] shadow-lg relative md:hidden">
                <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-white p-2 rounded-full bg-white/20 active:bg-white/30">
                    <FaArrowLeft />
                </button>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
                    <p className="text-purple-200 text-sm">Junte-se ao EDUConnect</p>
                </div>
            </div>

            {/* Form Container */}
            <div className="px-6 -mt-16 md:mt-0 md:px-12 md:py-10 relative z-10 h-full flex flex-col justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-0 shadow-xl md:shadow-none border border-gray-100 dark:border-none">
                    
                    {/* Desktop Header */}
                    <div className="hidden md:block mb-8">
                        <Link to="/" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-2 mb-4 text-sm font-bold"><FaArrowLeft /> Voltar</Link>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Criar Conta</h2>
                    </div>

                    {/* Role Switcher */}
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Common Fields */}
                        <div className="space-y-4">
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="fullName" onChange={handleChange} placeholder="Nome Completo" className={inputClasses} required />
                            </div>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="email" type="email" onChange={handleChange} placeholder="Email" className={inputClasses} required />
                            </div>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="password" type="password" onChange={handleChange} placeholder="Senha" className={inputClasses} required />
                            </div>
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input name="institution" onChange={handleChange} placeholder="Escola" className={inputClasses} required />
                                </div>
                                <div className="relative w-1/3">
                                    <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input name="age" type="number" onChange={handleChange} placeholder="Idade" className={inputClasses} required />
                                </div>
                            </div>
                        </div>

                        {/* Specific Fields */}
                        {role === "aluno" ? (
                            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
                                <div className="relative">
                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input name="guardianName" onChange={handleChange} placeholder="Nome do Responsável" className={inputClasses} required />
                                </div>
                                <div className="relative">
                                    <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input name="group" onChange={handleChange} placeholder="Turma (ex: 3A)" className={inputClasses} required />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
                                <div className="relative">
                                    <FaBook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input name="subjects" onChange={handleChange} placeholder="Matérias (sep. por vírgula)" className={inputClasses} required />
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg mt-4 active:scale-95 hover:bg-purple-700 transition-all"
                        >
                            {loading ? "Criando conta..." : "Cadastrar"}
                        </button>
                    </form>
                </div>
                
                <div className="mt-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Já tem uma conta? <Link to="/" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">Faça Login</Link></p>
                </div>
            </div>
         </div>
      </div>
    </Layout>
  );
}

export default Register;