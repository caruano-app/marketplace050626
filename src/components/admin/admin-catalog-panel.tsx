'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AdminCatalogPanel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState({ nome: '', nicho: 'geral' });
  const [newSub, setNewSub] = useState({ nome: '', paiId: '' });

  async function loadData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categorias_mestre')
        .select('*, subcategorias_mestre(*)')
        .order('nome_categoria');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Erro:', err);
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

  async function createSub() {
    if (!newSub.nome || !newSub.paiId) return alert('Preencha os campos');
    const slug = newSub.nome.toLowerCase().trim().replace(/\s+/g, '-');
    const { error } = await supabase.from('subcategorias_mestre').insert([
      { categoria_pai_id: newSub.paiId, nome_subcategoria: newSub.nome, slug_subcategoria: slug }
    ]);
    if (error) alert('Erro: ' + error.message);
    else { alert('Sucesso!'); setNewSub({ nome: '', paiId: '' }); loadData(); }
  }

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen text-black font-inter">
      <h1 className="text-3xl font-black mb-8 uppercase text-[#FFC300]">Gestão de Catálogo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Criar Categoria */}
        <div className="p-6 bg-zinc-50 rounded-2xl border-2 border-zinc-100">
          <h2 className="font-bold mb-4 uppercase text-xs text-zinc-400">Nova Categoria Mestre</h2>
          <input 
            className="w-full p-4 mb-4 rounded-xl border-2 border-zinc-200 focus:border-[#FFC300] outline-none bg-white text-black"
            placeholder="Ex: Moda Feminina"
            value={newCat.nome}
            onChange={e => setNewCat({...newCat, nome: e.target.value})}
          />
          <button onClick={createCategory} className="w-full bg-[#FFC300] font-bold p-4 rounded-xl hover:bg-black hover:text-white transition-all">
            CRIAR CATEGORIA
          </button>
        </div>

        {/* Criar Subcategoria */}
        <div className="p-6 bg-zinc-50 rounded-2xl border-2 border-zinc-100">
          <h2 className="font-bold mb-4 uppercase text-xs text-zinc-400">Nova Subcategoria</h2>
          <select 
            className="w-full p-4 mb-4 rounded-xl border-2 border-zinc-200 bg-white text-black min-h-[60px]"
            value={newSub.paiId}
            onChange={e => setNewSub({...newSub, paiId: e.target.value})}
          >
            <option value="">Selecionar Categoria Pai...</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nome_categoria}</option>
            ))}
          </select>
          <input 
            className="w-full p-4 mb-4 rounded-xl border-2 border-zinc-200 focus:border-[#FFC300] outline-none bg-white text-black"
            placeholder="Ex: Calças Jeans"
            value={newSub.nome}
            onChange={e => setNewSub({...newSub, nome: e.target.value})}
          />
          <button onClick={createSub} className="w-full bg-black text-white font-bold p-4 rounded-xl hover:bg-[#FFC300] hover:text-black transition-all">
            CRIAR SUBCATEGORIA
          </button>
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="mt-12">
        <h2 className="font-bold mb-6 uppercase text-zinc-400">Categorias Ativas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c: any) => (
            <div key={c.id} className="p-5 border-2 border-zinc-100 rounded-2xl">
              <div className="font-black text-lg text-black">{c.nome_categoria}</div>
              <div className="mt-3 space-y-2">
                {c.subcategorias_mestre?.map((s: any) => (
                  <div key={s.id} className="text-sm text-zinc-500 bg-zinc-50 p-2 rounded-lg">
                    • {s.nome_subcategoria}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}