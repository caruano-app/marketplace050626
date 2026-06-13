'use client';
import React, { useState } from 'react';

export default function AdminAppearancePanel() {
  return (
    <div className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm">
      <h2 className="text-2xl font-black mb-6 uppercase">Aparência e CMS</h2>
      <div className="p-12 border-2 border-dashed border-zinc-100 rounded-3xl text-center">
        <p className="text-zinc-400 italic">Módulo de Banners e Cores em manutenção.</p>
        <p className="text-xs text-zinc-300 mt-2 text-black">Aguardando configuração de buckets do Supabase.</p>
      </div>
    </div>
  );
}
