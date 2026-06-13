'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function CatalogManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ nome: '', nicho: 'geral' });

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from('categorias_mestre')
      .select('*')
      .order('nome_categoria', { ascending: true });

    if (!error) setCategories(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleCreateCategory() {
    if (!newCategory.nome) return alert('Digite o nome da categoria');
    const slug = newCategory.nome.toLowerCase().replace(/ /g, '-');
    
    const { error } = await supabase
      .from('categorias_mestre')
      .insert([{ 
        nome_categoria: newCategory.nome, 
        slug_categoria: slug,
        tipo_nicho: newCategory.nicho 
      }]);

    if (error) {
      alert('Erro ao criar: ' + error.message);
    } else {
      setNewCategory({ nome: '', nicho: 'geral' });
      fetchCategories();
    }
  }

  return (
    <div className="p-6 bg-white rounded-2xl border border-zinc-200">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-black uppercase">Gestão de Catálogo</h2>
        <p className="text-zinc-500 text-sm">Cadastre as categorias mestre do Caruano.</p>
      </div>

      {/* Formulário */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
        <input 
          type="text"
          placeholder="Nome da Categoria"
          className="p-3 rounded-lg border-2 border-zinc-200 text-black outline-none focus:border-[#FFC300]"
          value={newCategory.nome}
          onChange={(e) => setNewCategory({...newCategory, nome: e.target.value})}
        />
        <select 
          className="p-3 rounded-lg border-2 border-zinc-200 bg-white text-black min-h-[52px]"
          value={newCategory.nicho}
          onChange={(e) => setNewCategory({...newCategory, nicho: e.target.value})}
        >
          <option value="geral">Geral</option>
          <option value="moda">Moda</option>
          <option value="alimentos">Alimentos</option>
          <option value="servicos">Serviços</option>
        </select>
        <button 
          onClick={handleCreateCategory}
          className="bg-[#FFC300] text-black font-bold rounded-lg h-[52px] hover:bg-black hover:text-white transition-all"
        >
          + CRIAR CATEGORIA
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        <h3 className="font-bold text-black mb-4">Categorias Ativas ({categories.length})</h3>
        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
          {categories.map((cat: any) => (
            <div key={cat.id} className="flex justify-between items-center p-4 border border-zinc-200 rounded-xl">
              <span className="font-bold text-black">{cat.nome_categoria}</span>
              <span className="text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-500 uppercase">{cat.tipo_nicho}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}