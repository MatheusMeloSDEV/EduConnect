import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Layout from "../components/Layout";
import { FaGraduationCap, FaEnvelope, FaLock, FaArrowRight, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";

function Login() {
  // Pre-filled for easy testing
  const [email, setEmail] = useState("aluno@fiap.com.br");
  const [password, setPassword] = useState("123456");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'aluno' | 'professor'>('aluno');

  const setDemoLogin = (role: 'aluno' | 'professor') => {
    setActiveTab(role);
    if (role === 'aluno') {
      setEmail("aluno@fiap.com.br");
      setPassword("123456");
    } else {
      setEmail("ana@fiap.com.br");
      setPassword("123456");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/home");
    } catch (error: any) {
      alert("Falha no login: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout hideNav>
      <div className="flex flex-col md:flex-row h-full">
        
        {/* Mobile Header / Desktop Left Panel */}
        <div className="flex-1 flex flex-col justify-center items-center gap-6 bg-gradient-to-br from-purple-700 to-purple-500 text-white p-10 min-h-[40vh] md:min-h-full">
          <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm shadow-xl animate-bounce-slow">
            <FaGraduationCap size={48} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">EDUConnect</h1>
            <p className="text-white/80 text-sm md:text-xl">Sua plataforma de aprendizado, em qualquer lugar.</p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="w-full md:w-[500px] bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-none p-8 pb-12 shadow-2xl md:shadow-none animate-slide-up md:animate-none flex flex-col justify-center -mt-6 md:mt-0 relative z-10 transition-colors duration-300">
          
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">Bem-vindo(a)!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Selecione seu perfil para entrar.</p>

            {/* Demo Toggles */}
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-6">
                <button 
                    type="button"
                    onClick={() => setDemoLogin('aluno')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'aluno' ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm" : "text-gray-400 dark:text-gray-400"}`}
                >
                    <FaUserGraduate /> Aluno
                </button>
                <button 
                    type="button"
                    onClick={() => setDemoLogin('professor')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'professor' ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm" : "text-gray-400 dark:text-gray-400"}`}
                >
                    <FaChalkboardTeacher /> Professor
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white font-medium transition-all"
                />
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white font-medium transition-all"
                />
              </div>
              
              <div className="flex justify-end">
                  <a href="#" className="text-sm text-purple-600 dark:text-purple-400 font-bold hover:underline">Esqueceu a senha?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 hover:bg-purple-700 transition-all"
              >
                {loading ? "Entrando..." : (
                  <>
                    Entrar <FaArrowRight />
                  </>
                )}
              </button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Não tem conta? <Link to="/register" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">Cadastre-se</Link></p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Login;