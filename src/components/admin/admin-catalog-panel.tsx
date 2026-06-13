'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type Category = {
  id: string;
  nome_categoria: string;
  slug_categoria: string;
  tipo_nicho: string;
  subcategorias_mestre: Subcategory[];
};

type Subcategory = {
  id: string;
  nome_subcategoria: string;
  slug_subcategoria: string;
  categoria_pai_id: string;
};

type Props = {
  categories: Category[];
  subcategories: Subcategory[];
};

export function AdminCatalogPanel({ categories: initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories || []);
  const [newCat, setNewCat] = useState({ nome: '', nicho: 'geral' });
  const [newSub, setNewSub] = useState({ nome: '', paiId: '' });
  const [loading, setLoading] = useState(false);

  async function reloadData() {
    setLoading(true);
    const { data } = await supabase
      .from('categorias_mestre')
      .select('*, subcategorias_mestre(*)')
      .order('nome_categoria');
    setCategories(data || []);
    setLoading(false);
  }

  async function createCategory() {
    if (!newCat.nome) return alert('Digite o nome');
    const slug = newCat.nome.toLowerCase().trim().replace(/\s+/g, '-');
    const { error } = await supabase.from('categorias_mestre').insert([
      { nome_categoria: newCat.nome, slug_categoria: slug, tipo_nicho: newCat.nicho }
    ]);
    if (error) alert('Erro: ' + error.message);
    else {
      alert('Sucesso!');
      setNewCat({ nome: '', nicho: 'geral' });
      reloadData();
    }
  }

  async function createSub() {
    if (!newSub.nome || !newSub.paiId) return alert('Preencha os campos');
    const slug = newSub.nome.toLowerCase().trim().replace(/\s+/g, '-');
    const { error } = await supabase.from('subcategorias_mestre').insert([
      { categoria_pai_id: newSub.paiId, nome_subcategoria: newSub.nome, slug_subcategoria: slug }
    ]);
    if (error) alert('Erro: ' + error.message);
    else {
      alert('Sucesso!');
      setNewSub({ nome: '', paiId: '' });
      reloadData();
    }
  }

  return (
    <div className="space-y-6 rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Gestão de Catálogo</h2>

      <div className="space-y-2">
        <h3 className="font-semibold">Nova Categoria Mestre</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nome da categoria"
            className="flex-1 rounded border px-3 py-2"
            value={newCat.nome}
            onChange={(e) => setNewCat({ ...newCat, nome: e.target.value })}
          />
          <select
            className="rounded border px-3 py-2"
            value={newCat.nicho}
            onChange={(e) => setNewCat({ ...newCat, nicho: e.target.value })}
          >
            <option value="geral">Geral</option>
            <option value="alimenticio">Alimentício</option>
            <option value="servico">Serviço</option>
          </select>
          <button
            onClick={createCategory}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            CRIAR CATEGORIA
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Nova Subcategoria</h3>
        <div className="flex gap-2">
          <select
            className="rounded border px-3 py-2"
            value={newSub.paiId}
            onChange={(e) => setNewSub({ ...newSub, paiId: e.target.value })}
          >
            <option value="">Selecionar Categoria Pai...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_categoria}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Nome da subcategoria"
            className="flex-1 rounded border px-3 py-2"
            value={newSub.nome}
            onChange={(e) => setNewSub({ ...newSub, nome: e.target.value })}
          />
          <button
            onClick={createSub}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            CRIAR SUBCATEGORIA
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Categorias Ativas</h3>
        {loading && <div className="p-4">Carregando...</div>}
        <div className="space-y-3">
          {categories.map((c) => (
            <div key={c.id} className="rounded border p-3">
              <p className="font-medium">{c.nome_categoria}</p>
              <div className="ml-4 mt-1 space-y-1 text-sm text-gray-600">
                {c.subcategorias_mestre?.map((s) => (
                  <div key={s.id}>• {s.nome_subcategoria}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
