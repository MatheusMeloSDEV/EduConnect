import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { certificateService } from "../services/api";
import { FaArrowLeft, FaAward, FaShieldAlt, FaBookOpen } from "react-icons/fa";

// Tipagem baseada no que o nosso backend envia
interface CertificateData {
  _id: string;
  authHash: string;
  createdAt: string;
  article: {
    _id: string;
    headline: string;
    imageUrl: string;
    writer: {
      fullName: string;
    };
  };
}

function MyCertificates() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await certificateService.getMyCertificates();
      setCertificates(res.data);
    } catch (error) {
      console.error("Erro ao buscar certificados:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 md:max-w-4xl md:mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Meus Certificados</h1>
            <p className="text-sm text-gray-500">Histórico de conclusões e conquistas</p>
          </div>
        </div>

        {/* Estado de Carregamento */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-purple-600">
            <FaAward className="animate-pulse mb-4 text-gray-300 dark:text-gray-600" size={48} />
            <p className="font-bold text-gray-500">Buscando suas conquistas...</p>
          </div>
        ) : (
          <>
            {/* Estado Vazio (Nenhum certificado) */}
            {certificates.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl text-center shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="bg-purple-50 dark:bg-purple-900/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaAward size={40} className="text-purple-300 dark:text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Ainda não há certificados</h2>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                  Você ainda não concluiu nenhum material. Explore os artigos disponíveis e comece a aprender agora mesmo!
                </p>
                <button 
                  onClick={() => navigate('/home')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95"
                >
                  Explorar Materiais
                </button>
              </div>
            ) : (
              /* Lista de Certificados */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <div key={cert._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                    
                    {/* Imagem do Artigo */}
                    <div className="h-32 w-full relative overflow-hidden">
                      <img 
                        src={cert.article.imageUrl} 
                        alt="Capa do Artigo" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="text-white font-bold text-sm line-clamp-2 leading-snug">
                          {cert.article.headline}
                        </p>
                      </div>
                    </div>

                    {/* Detalhes do Certificado */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-wider">Lecionado por</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {cert.article.writer?.fullName || "Professor Anônimo"}
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase flex items-center gap-1">
                            <FaShieldAlt /> Hash de Validação
                          </p>
                          <p className="text-xs font-mono text-gray-600 dark:text-gray-300">
                            {new Date(cert.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-mono text-sm font-bold text-gray-900 dark:text-white break-all">
                          {cert.authHash}
                        </p>
                      </div>

                      <button 
                        onClick={() => navigate(`/articles/${cert.article._id}`)}
                        className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 py-2.5 rounded-xl transition-colors"
                      >
                        <FaBookOpen /> Revisar Material
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default MyCertificates;