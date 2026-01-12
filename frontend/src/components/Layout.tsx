
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaCompass, FaGraduationCap, FaPen, FaCog } from "react-icons/fa";
import useAuth from "../hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNav = false }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  // Layout especial para páginas de Autenticação (Login/Registro)
  if (hideNav) {
    return (
      <div className="min-h-screen bg-white md:bg-gray-100 dark:bg-gray-900 dark:md:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="w-full h-full md:h-auto md:max-w-6xl bg-white dark:bg-gray-800 md:rounded-2xl md:shadow-2xl overflow-hidden relative flex flex-col md:flex-row">
           {children}
        </div>
      </div>
    );
  }

  // Layout do Painel
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 pb-[80px] md:pb-0 overflow-x-hidden transition-colors duration-300"> {/* Prevenir rolagem horizontal do corpo */}
      
      {/* Barra Lateral Desktop (Fixa, largura 256px) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full z-30 shadow-sm transition-colors duration-300">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <FaGraduationCap size={28} />
            <span className="font-bold text-xl tracking-tight">EDUConnect</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <SidebarLink to="/home" icon={FaHome} label="Home" active={isActive('/home')} />
          <SidebarLink to="/articles" icon={FaCompass} label="Explorar" active={isActive('/articles')} />
          {user?.role === 'professor' && (
            <>
              <SidebarLink to="/articles/create" icon={FaPen} label="Escrever" active={isActive('/articles/create')} />
              <SidebarLink to="/admin" icon={FaCog} label="Administração" active={location.pathname.startsWith('/admin')} />
            </>
          )}
          <SidebarLink to="/profile" icon={FaUser} label="Perfil" active={isActive('/profile')} />
        </nav>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700">
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4">
             <p className="text-sm font-bold text-purple-800 dark:text-purple-300">Versão App</p>
             <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">v2.1 Mobile</p>
          </div>
        </div>
      </aside>

      {/* Wrapper do Conteúdo Principal */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 min-h-screen w-full relative">
        
        {/* Barra Superior Mobile (Sensação de App Nativo) */}
        <header className="md:hidden sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 pt-safe px-4 h-[calc(56px+env(safe-area-inset-top))] flex items-center justify-center shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 pt-2">
             <FaGraduationCap size={22} />
             <span className="font-bold text-lg tracking-tight">EDUConnect</span>
          </div>
        </header>
        
        <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
          {/* 
             Estratégia de Container:
             - Mobile: Largura total.
             - Desktop: Largura máxima 7xl (1280px) centralizada.
          */}
          <div className="w-full h-full md:max-w-7xl md:mx-auto md:p-8">
             <div className="h-full">
                {children}
             </div>
          </div>
        </main>
      </div>

      {/* Navegação Inferior Mobile (Fixa e Ciente da Área Segura) */}
      {!hideNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 px-6 py-2 flex justify-between items-center z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-colors duration-300">
          <MobileLink to="/home" icon={FaHome} label="Home" active={isActive('/home')} />
          <MobileLink to="/articles" icon={FaCompass} label="Explorar" active={isActive('/articles')} />
          {user?.role === 'professor' && (
             <MobileLink to="/admin" icon={FaCog} label="Admin" active={location.pathname.startsWith('/admin')} />
          )}
          <MobileLink to="/profile" icon={FaUser} label="Perfil" active={isActive('/profile')} />
        </nav>
      )}
    </div>
  );
};

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
    }`}
  >
    <Icon size={20} className={active ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"} />
    <span className="text-sm">{label}</span>
  </Link>
);

const MobileLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link to={to} className={`flex flex-1 flex-col items-center justify-center gap-1 py-1.5 transition-all active:scale-95 ${active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`}>
    <div className={`p-1 rounded-xl transition-colors duration-300 ${active ? 'bg-purple-50 dark:bg-purple-900/30' : 'bg-transparent'}`}>
       <Icon size={20} className={active ? "text-purple-600 dark:text-purple-400" : ""} />
    </div>
    <span className="text-[11px] font-medium">{label}</span>
  </Link>
);

export default Layout;
