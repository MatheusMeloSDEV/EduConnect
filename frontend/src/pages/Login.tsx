import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Layout from "../components/Layout";
import { FaGraduationCap, FaEnvelope, FaLock, FaArrowRight, FaInfoCircle } from "react-icons/fa";

function Login() {
  // Pre-filled for easy testing, but allows editing
  const [email, setEmail] = useState("aluno@fiap.com.br");
  const [password, setPassword] = useState("123456");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
        <div className="w-full md:w-[500px] bg-white rounded-t-3xl md:rounded-none p-8 pb-12 shadow-2xl md:shadow-none animate-slide-up md:animate-none flex flex-col justify-center -mt-6 md:mt-0 relative z-10">
          
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Bem-vindo(a)!</h2>
            <p className="text-gray-500 mb-8">Insira seus dados para acessar sua conta.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-gray-800 font-medium transition-all"
                />
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-gray-800 font-medium transition-all"
                />
              </div>
              
              <div className="flex justify-end">
                  <a href="#" className="text-sm text-purple-600 font-bold hover:underline">Esqueceu a senha?</a>
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
              <p className="text-gray-500 text-sm">Não tem conta? <Link to="/register" className="text-purple-600 font-bold hover:underline">Cadastre-se</Link></p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Login;