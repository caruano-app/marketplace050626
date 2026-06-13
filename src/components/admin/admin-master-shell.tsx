'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminMasterShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'DASHBOARD', href: '/admin' },
    { label: 'APARÊNCIA (CMS)', href: '/admin?tab=aparencia' },
    { label: 'CATÁLOGO', href: '/admin?tab=catalogo' },
    { label: 'VENDAS & B2B', href: '/admin?tab=vendas' },
    { label: 'SEGURANÇA (KYC)', href: '/admin?tab=kyc' },
    { label: 'EQUIPE', href: '/admin?tab=equipe' },
    { label: 'LOGÍSTICA', href: '/admin?tab=logistica' },
    { label: 'CONTEÚDO', href: '/admin?tab=conteudo' },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 text-black font-inter">
      {/* Sidebar Desktop - Apenas Texto */}
      <aside className="hidden lg:flex w-72 bg-zinc-900 p-8 flex-col gap-2 fixed h-full text-white z-50 shadow-2xl">
        <div className="mb-12 px-2">
          <div className="text-[#FFC300] font-black text-2xl font-montserrat uppercase tracking-tighter leading-none">
            Caruano<br/><span className="text-white text-lg">360 Admin</span>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1">
          {menuItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              className="py-3 px-4 rounded-lg hover:bg-zinc-800 hover:text-[#FFC300] text-sm font-bold tracking-widest transition-all border-l-2 border-transparent hover:border-[#FFC300]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-800 flex flex-col gap-2">
          <Link href="/" className="px-4 py-2 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
            Visualizar Site
          </Link>
          <button className="px-4 py-2 text-left text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors">
            Sair da Torre
          </button>
        </div>
      </aside>

      {/* Menu Mobile */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-[60] bg-black text-[#FFC300] px-4 py-2 font-black text-sm rounded-md shadow-lg border border-[#FFC300]"
      >
        {isMobileMenuOpen ? 'FECHAR' : 'MENU'}
      </button>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-zinc-900 z-[55] p-10 flex flex-col gap-6 text-white">
          <div className="text-[#FFC300] font-black text-3xl mb-10 uppercase font-montserrat">Caruano 360</div>
          {menuItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-black tracking-tighter border-b border-zinc-800 pb-2"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* Área de Conteúdo (O Frame) */}
      <main className="flex-1 lg:ml-72 min-h-screen">
        <div className="max-w-[1412px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
