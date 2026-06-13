'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AdminCatalogPanel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState({ nome: '', nicho: 'geral' });

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('categorias_mestre').select('*').order('nome_categoria');
    if (data) setCategories(data);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function createCategory() {
    if (!newCat.nome) return alert('Digite o nome');
    const slug = newCat.nome.toLowerCase().trim().replace(/\s+/g, '-');
    const { error } = await supabase.from('categorias_mestre').insert([
      { nome_categoria: newCat.nome, slug_categoria: slug, tipo_nicho: newCat.nicho }
    ]);
    if (error) alert('Erro: ' + error.message);
    else { alert('Sucesso!'); setNewCat({ nome: '', nicho: 'geral' }); loadData(); }
  }

  return (
    <div className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm">
      <h2 className="text-2xl font-black mb-6 uppercase">Gestão de Catálogo</h2>
      <div className="flex gap-4 mb-8 bg-zinc-50 p-4 rounded-2xl">
        <input 
          className="flex-1 p-4 rounded-xl border-2 border-zinc-200 text-black outline-none focus:border-[#FFC300]"
          placeholder="Nova Categoria"
          value={newCat.nome}
          onChange={e => setNewCat({...newCat, nome: e.target.value})}
        />
        <button onClick={createCategory} className="bg-[#FFC300] px-8 font-bold rounded-xl hover:bg-black hover:text-white transition-all">
          CRIAR
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((c: any) => (
          <div key={c.id} className="p-4 border border-zinc-100 rounded-xl flex justify-between items-center">
            <span className="font-bold text-black">{c.nome_categoria}</span>
            <span className="text-xs uppercase text-zinc-400">{c.tipo_nicho}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
