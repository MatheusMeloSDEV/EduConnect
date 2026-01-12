import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaCompass, FaGraduationCap } from "react-icons/fa";

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNav = false }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Special layout for Auth pages (Login/Register)
  if (hideNav) {
    return (
      <div className="min-h-screen bg-white md:bg-gray-100 flex items-center justify-center">
        <div className="w-full h-full md:h-auto md:max-w-6xl bg-white md:rounded-2xl md:shadow-2xl overflow-hidden relative flex flex-col md:flex-row">
           {children}
        </div>
      </div>
    );
  }

  // Dashboard Layout
  return (
    <div className="flex min-h-screen bg-gray-50 pb-[80px] md:pb-0 overflow-x-hidden"> {/* Prevent body horizontal scroll */}
      
      {/* Desktop Sidebar (Fixed, 256px width) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-30 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-purple-600">
            <FaGraduationCap size={28} />
            <span className="font-bold text-xl tracking-tight">EDUConnect</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <SidebarLink to="/home" icon={FaHome} label="Home" active={isActive('/home')} />
          <SidebarLink to="/articles" icon={FaCompass} label="Explorar" active={isActive('/articles')} />
          <SidebarLink to="/profile" icon={FaUser} label="Perfil" active={isActive('/profile')} />
        </nav>

        <div className="p-6 border-t border-gray-100">
          <div className="bg-purple-50 rounded-xl p-4">
             <p className="text-sm font-bold text-purple-800">Versão App</p>
             <p className="text-xs text-purple-600 mt-1">v2.0 Mobile</p>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 min-h-screen w-full relative">
        
        {/* Mobile Top Bar (Native App Feel) */}
        <header className="md:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 pt-safe px-4 h-[calc(56px+env(safe-area-inset-top))] flex items-center justify-center shadow-sm">
          <div className="flex items-center gap-2 text-purple-600 pt-2">
             <FaGraduationCap size={22} />
             <span className="font-bold text-lg tracking-tight">EDUConnect</span>
          </div>
        </header>
        
        <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
          {/* 
             Container Strategy:
             - Mobile: Full width.
             - Desktop: Max width 7xl (1280px) centered.
          */}
          <div className="w-full h-full md:max-w-7xl md:mx-auto md:p-8">
             <div className="h-full">
                {children}
             </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Fixed & Safe Area Aware) */}
      {!hideNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-6 py-2 flex justify-between items-center z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <MobileLink to="/home" icon={FaHome} label="Home" active={isActive('/home')} />
          <MobileLink to="/articles" icon={FaCompass} label="Explorar" active={isActive('/articles')} />
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
        ? 'bg-purple-50 text-purple-700 font-semibold' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon size={20} className={active ? "text-purple-600" : "text-gray-400 group-hover:text-gray-600"} />
    <span className="text-sm">{label}</span>
  </Link>
);

const MobileLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link to={to} className={`flex flex-1 flex-col items-center justify-center gap-1 py-1.5 transition-all active:scale-95 ${active ? 'text-purple-600' : 'text-gray-400'}`}>
    <div className={`p-1 rounded-xl transition-colors duration-300 ${active ? 'bg-purple-50' : 'bg-transparent'}`}>
       <Icon size={20} className={active ? "text-purple-600" : ""} />
    </div>
    <span className="text-[11px] font-medium">{label}</span>
  </Link>
);

export default Layout;