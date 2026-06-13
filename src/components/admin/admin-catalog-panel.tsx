'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AdminCatalogPanel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState({ nome: '', nicho: 'geral' });
  const [newSub, setNewSub] = useState({ nome: '', paiId: '' });

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from('categorias_mestre')
      .select('*, subcategorias_mestre(*)')
      .order('nome_categoria');
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
    else { setNewCat({ nome: '', nicho: 'geral' }); loadData(); }
  }

  async function createSub() {
    if (!newSub.nome || !newSub.paiId) return alert('Preencha nome e selecione a categoria pai');
    const slug = newSub.nome.toLowerCase().trim().replace(/\s+/g, '-');
    const { error } = await supabase.from('subcategorias_mestre').insert([
      { categoria_pai_id: newSub.paiId, nome_subcategoria: newSub.nome, slug_subcategoria: slug }
    ]);
    if (error) alert('Erro: ' + error.message);
    else { setNewSub({ nome: '', paiId: '' }); loadData(); }
  }

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-black mb-8 uppercase font-montserrat">Gestão de Catálogo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Criar Categoria */}
        <div className="p-6 bg-zinc-50 rounded-2xl border-2 border-zinc-100">
          <h2 className="font-bold mb-4 uppercase text-sm text-zinc-500">Nova Categoria Mestre</h2>
          <div className="space-y-4">
            <input 
              className="w-full p-4 rounded-xl border-2 border-zinc-200 focus:border-[#FFC300] outline-none"
              placeholder="Nome (Ex: Moda Feminina)"
              value={newCat.nome}
              onChange={e => setNewCat({...newCat, nome: e.target.value})}
            />
            <button onClick={createCategory} className="w-full bg-[#FFC300] font-bold p-4 rounded-xl hover:bg-black hover:text-white transition-all">
              CRIAR CATEGORIA MESTRE
            </button>
          </div>
        </div>

        {/* Criar Subcategoria */}
        <div className="p-6 bg-zinc-50 rounded-2xl border-2 border-zinc-100">
          <h2 className="font-bold mb-4 uppercase text-sm text-zinc-500">Nova Subcategoria</h2>
          <div className="space-y-4">
            <select 
              className="w-full p-4 rounded-xl border-2 border-zinc-200 bg-white min-h-[60px]"
              value={newSub.paiId}
              onChange={e => setNewSub({...newSub, paiId: e.target.value})}
            >
              <option value="">Selecionar Categoria Pai...</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.nome_categoria}</option>
              ))}
            </select>
            <input 
              className="w-full p-4 rounded-xl border-2 border-zinc-200 focus:border-[#FFC300] outline-none"
              placeholder="Nome da Sub (Ex: Calças Jeans)"
              value={newSub.nome}
              onChange={e => setNewSub({...newSub, nome: e.target.value})}
            />
            <button onClick={createSub} className="w-full bg-black text-white font-bold p-4 rounded-xl hover:bg-[#FFC300] hover:text-black transition-all">
              CRIAR SUBCATEGORIA
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Visualização */}
      <div className="mt-12">
        <h2 className="font-bold mb-6 uppercase">Categorias Ativas</h2>
        {loading ? <p>Carregando...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c: any) => (
              <div key={c.id} className="p-4 border-2 border-zinc-100 rounded-2xl">
                <div className="font-black text-lg text-[#FFC300]">{c.nome_categoria}</div>
                <div className="mt-2 space-y-1">
                  {c.subcategorias_mestre?.map((s: any) => (
                    <div key={s.id} className="text-sm text-zinc-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-zinc-300 rounded-full"></span>
                      {s.nome_subcategoria}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}