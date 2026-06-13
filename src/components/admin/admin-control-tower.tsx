'use client';

import React from 'react';

export default function AdminControlTower() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black font-montserrat uppercase">Admin Caruano</h1>
        <p className="text-zinc-500">Bem-vindo à Torre de Controle Master.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFC300] p-6 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase opacity-60">Status do Sistema</p>
          <p className="text-2xl font-black text-black">ONLINE</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-zinc-400">Ambiente</p>
          <p className="text-2xl font-black text-black text-black">PRODUÇÃO</p>
        </div>
        <div className="bg-black p-6 rounded-2xl shadow-sm">
          <p className="text-xs font-bold uppercase text-zinc-500">Versão</p>
          <p className="text-2xl font-black text-[#FFC300]">v1.0.0</p>
        </div>
      </div>

      <div className="mt-12 p-12 border-2 border-dashed border-zinc-200 rounded-3xl text-center">
        <p className="text-zinc-400 italic">Use a barra lateral para navegar pelos módulos de gestão.</p>
      </div>
    </div>
  );
}
