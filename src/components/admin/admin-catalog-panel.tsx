'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AdminCatalogPanel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState({ nome: '', nicho: 'geral' });

  async function loadData() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('categorias_mestre').select('*').order('nome_categoria');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
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
    <div className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm font-inter">
      <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">Gestão de Catálogo</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
        <input 
          className="flex-1 p-4 rounded-xl border-2 border-zinc-200 text-black outline-none focus:border-[#FFC300] bg-white font-bold"
          placeholder="NOME DA NOVA CATEGORIA"
          value={newCat.nome}
          onChange={e => setNewCat({...newCat, nome: e.target.value})}
        />
        <button onClick={createCategory} className="bg-[#FFC300] px-10 py-4 font-black rounded-xl hover:bg-black hover:text-white transition-all uppercase text-sm tracking-widest">
          Criar Categoria
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c: any) => (
          <div key={c.id} className="p-5 border-2 border-zinc-100 rounded-2xl flex justify-between items-center hover:border-[#FFC300] transition-colors">
            <span className="font-black text-black uppercase text-sm">{c.nome_categoria}</span>
            <span className="text-[10px] font-bold uppercase text-zinc-400 bg-zinc-100 px-2 py-1 rounded">{c.tipo_nicho}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
