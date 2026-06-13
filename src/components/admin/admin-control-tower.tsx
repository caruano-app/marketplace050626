'use client';
import React from 'react';

export default function AdminControlTower() {
  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-medium text-zinc-900 mb-8 tracking-tight">Visão Geral</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Status</p>
          <p className="text-2xl font-semibold text-emerald-600">Sistema Online</p>
        </div>
        <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Ambiente</p>
          <p className="text-2xl font-semibold">Produção</p>
        </div>
        <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Versão</p>
          <p className="text-2xl font-semibold text-[#FFC300]">1.0.0</p>
        </div>
      </div>
    </div>
  );
}
