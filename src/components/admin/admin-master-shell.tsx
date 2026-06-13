'use client';
import React from 'react';
import Link from 'next/link';

export default function AdminMasterShell({ children }: { children: React.ReactNode }) {
  const menu = [
    { n: 'DASHBOARD', h: '/admin' },
    { n: 'CATÁLOGO', h: '/admin?tab=catalogo' },
    { n: 'INTELIGÊNCIA', h: '/admin/inteligencia' },
    { n: 'IMPORTAR B2B', h: '/admin/importar' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f4f4] text-black font-inter">
      <aside className="w-64 bg-white border-r border-zinc-200 fixed h-full p-6 flex flex-col">
        <div className="mb-10 font-black text-2xl tracking-tighter">CARUANO</div>
        <nav className="flex-1 space-y-1">
          {menu.map(i => (
            <Link key={i.n} href={i.h} className="block py-3 px-4 text-xs font-bold hover:bg-[#FFC300] rounded-lg transition-colors uppercase tracking-wider">
              {i.n}
            </Link>
          ))}
        </nav>
        <Link href="/" className="text-xs font-medium text-zinc-400 hover:text-black uppercase">Sair</Link>
      </aside>
      <main className="flex-1 ml-64 p-10">{children}</main>
    </div>
  );
}
