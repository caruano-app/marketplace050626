'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminMasterShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: '📊', href: '/admin' },
    { label: 'Aparência (CMS)', icon: '🎨', href: '/admin?tab=aparencia' },
    { label: 'Catálogo', icon: '📁', href: '/admin?tab=catalogo' },
    { label: 'Vendas & B2B', icon: '🛒', href: '/admin?tab=vendas' },
    { label: 'Segurança (KYC)', icon: '🛡️', href: '/admin?tab=kyc' },
    { label: 'Equipe', icon: '👥', href: '/admin?tab=equipe' },
    { label: 'Logística', icon: '🚚', href: '/admin?tab=logistica' },
    { label: 'Conteúdo', icon: '📝', href: '/admin?tab=conteudo' },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 text-black font-inter">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 bg-zinc-900 p-6 flex-col gap-2 fixed h-full text-white z-50 shadow-2xl">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-[#FFC300] rounded-xl flex items-center justify-center text-black font-black text-xl">C</div>
          <span className="text-[#FFC300] font-black text-xl font-montserrat uppercase tracking-tighter">Caruano 360</span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1">
          {menuItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-zinc-800 hover:text-[#FFC300] font-bold transition-all group"
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-800 space-y-2">
          <Link href="/" className="flex items-center gap-3 p-3 text-zinc-400 hover:text-white text-sm transition-colors">
            🔗 Visualizar Site
          </Link>
          <button className="flex items-center gap-3 p-3 w-full text-red-400 hover:text-red-300 text-sm font-bold transition-colors">
            🚪 Sair da Torre
          </button>
        </div>
      </aside>

      {/* Menu Mobile */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-[60] bg-black text-[#FFC300] p-3 rounded-full shadow-lg"
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black z-[55] p-8 flex flex-col gap-4 text-white">
          <div className="text-[#FFC300] font-black text-2xl mb-8 uppercase">Caruano 360</div>
          {menuItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-bold flex items-center gap-4"
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* Área de Conteúdo */}
      <main className="flex-1 lg:ml-72 min-h-screen">
        <div className="max-w-[1412px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
