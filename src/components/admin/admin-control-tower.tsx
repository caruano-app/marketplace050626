'use client';
import React from 'react';

export default function AdminControlTower() {
  return (
    <div className="p-8 font-inter">
      <h1 className="text-4xl font-black text-black font-montserrat uppercase mb-2 tracking-tighter">Admin Caruano</h1>
      <p className="text-zinc-500 mb-10 font-bold uppercase text-xs tracking-widest">Torre de Controle Master</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFC300] p-10 rounded-3xl shadow-sm border border-black/5">
          <p className="font-black uppercase opacity-40 text-[10px] tracking-[0.2em] mb-2">Status do Sistema</p>
          <p className="text-4xl font-black text-black">ONLINE</p>
        </div>
        <div className="bg-white p-10 rounded-3xl border-2 border-zinc-100 shadow-sm">
          <p className="font-black uppercase text-zinc-300 text-[10px] tracking-[0.2em] mb-2">Ambiente Atual</p>
          <p className="text-4xl font-black text-black">PRODUÇÃO</p>
        </div>
        <div className="bg-zinc-900 p-10 rounded-3xl shadow-xl text-white border border-[#FFC300]/20">
          <p className="font-black uppercase text-zinc-500 text-[10px] tracking-[0.2em] mb-2">Versão do Core</p>
          <p className="text-4xl font-black text-[#FFC300]">V1.0.0</p>
        </div>
      </div>

      <div className="mt-12 p-16 border-2 border-dashed border-zinc-200 rounded-[40px] text-center">
        <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Aguardando seleção de módulo na barra lateral</p>
      </div>
    </div>
  );
}
