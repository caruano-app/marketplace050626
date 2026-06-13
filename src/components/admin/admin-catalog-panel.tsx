'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AdminCatalogPanel() {
  const [categories, setCategories] = useState<any[]>([]);
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

  useEffect(() => {
    loadData();
  }, []);

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
      loadData();
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
      loadData();
    }
  }

  if (loading) return <div className="p-4">Carregando catálogo...</div>;

  return (
    <div className="space-y-6 rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Gestão de Catálogo</h2>

      {/* Criar Categoria */}
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
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            CRIAR CATEGORIA
          </button>
        </div>
      </div>

      {/* Criar Subcategoria */}
      <div className="space-y-2">
        <h3 className="font-semibold">Nova Subcategoria</h3>
        <div className="flex gap-2">
          <select
            className="rounded border px-3 py-2"
            value={newSub.paiId}
            onChange={(e) => setNewSub({ ...newSub, paiId: e.target.value })}
          >
            <option value="">Selecionar Categoria Pai...</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.nome_categoria}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Nome da subcategoria"
            className="flex-1 rounded border px-3
