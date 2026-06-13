
"use client";
import React from 'react';
import Link from 'next/link';
export default function AdminMasterShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50 text-black font-inter">
      <aside className="w-64 bg-zinc-900 p-6 flex flex-col gap-4 fixed h-full text-white">
        <div className="text-[#FFC300] font-black text-xl mb-8 font-montserrat">CARUANO 360</div>
        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="p-3 rounded-lg hover:bg-zinc-800 font-bold transition-all">📊 Dashboard</Link>
          <Link href="/admin?tab=catalogo" className="p-3 rounded-lg hover:bg-zinc-800 font-bold transition-all">📁 Catálogo</Link>
        </nav>
        <div className="mt-auto">
          <Link href="/" className="text-zinc-500 text-sm hover:text-white">Voltar ao Site</Link>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
