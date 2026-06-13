'use client';
import React from 'react';

export default function AdminControlTower() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-black text-black font-montserrat uppercase mb-2">Admin Caruano</h1>
      <p className="text-zinc-500 mb-8">Bem-vindo à Torre de Controle Master.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFC300] p-8 rounded-3xl shadow-sm"><p className="font-bold uppercase opacity-60 text-xs">Status</p><p className="text-3xl font-black">ONLINE</p></div>
        <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm"><p className="font-bold uppercase text-zinc-400 text-xs">Ambiente</p><p className="text-3xl font-black">PRODUÇÃO</p></div>
        <div className="bg-zinc-900 p-8 rounded-3xl shadow-sm text-white"><p className="font-bold uppercase text-zinc-500 text-xs">Versão</p><p className="text-3xl font-black text-[#FFC300]">v1.0.0</p></div>
      </div>
    </div>
  );
}
