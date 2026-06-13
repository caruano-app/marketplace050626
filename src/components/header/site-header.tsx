'use client';
import React from 'react';
import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="w-full bg-[#FFC300] sticky top-0 z-[100]">
      {/* Linha Superior - Busca */}
      <div className="max-w-[1412px] mx-auto px-4 h-16 flex items-center gap-8">
        <Link href="/" className="text-2xl font-black tracking-tighter text-black">
          CARUANO
        </Link>
        
        <div className="flex-1 hidden md:flex relative">
          <input 
            type="text" 
            placeholder="O que você está procurando hoje?" 
            className="w-full h-10 px-5 rounded-full text-sm outline-none border-none shadow-inner"
          />
          <button className="absolute right-0 bg-black text-white h-10 px-6 rounded-full text-xs font-bold uppercase">
            Buscar
          </button>
        </div>

        <div className="flex items-center gap-6 text-black font-bold text-xs uppercase tracking-widest">
          <Link href="/login" className="hover:opacity-70">Entrar</Link>
          <Link href="/checkout" className="bg-black text-white px-4 py-2 rounded-full">Carrinho</Link>
        </div>
      </div>

      {/* Linha Inferior - Menu */}
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-[1412px] mx-auto px-4 h-10 flex items-center gap-6 overflow-x-auto no-scrollbar">
          {['Moda', 'Alimentos', 'Insumos', 'Serviços', 'Vagas', 'Clube'].map((item) => (
            <Link key={item} href={`/categoria/${item.toLowerCase()}`} className="text-[11px] font-bold text-zinc-600 hover:text-black uppercase whitespace-nowrap">
              {item}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
