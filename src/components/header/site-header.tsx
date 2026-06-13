'use client';
import React from 'react';
import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="w-full bg-[#FFC300] sticky top-0 z-[100] font-inter shadow-sm">
      <div className="max-w-[1412px] mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-black tracking-tighter uppercase">CARUANO</Link>
        <div className="flex items-center gap-4 text-black font-bold text-xs uppercase">
          <Link href="/admin" className="hover:opacity-70">Painel</Link>
          <Link href="/checkout" className="bg-black text-white px-4 py-2 rounded-full">Carrinho</Link>
        </div>
      </div>
    </header>
  );
}

// Exportação nomeada para garantir que ninguém quebre
export const SiteHeader = () => <SiteHeaderComponent />;
const SiteHeaderComponent = SiteHeader;
