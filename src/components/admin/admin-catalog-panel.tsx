'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { Plus, FolderTree, RefreshCw, Trash2 } from 'lucide-react';

export default function CatalogManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ nome: '', nicho: 'geral' });

  // Busca categorias reais do banco
  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from('categorias_mestre')
      .select('*')
      .order('nome_categoria', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar categorias');
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleCreateCategory() {
    if (!newCategory.nome) return toast.error('Digite o nome da categoria');

    const slug = newCategory.nome.toLowerCase().replace(/ /g, '-');
    
    const { error } = await supabase
      .from('categorias_mestre')
      .insert([{ 
        nome_categoria: newCategory.nome, 
        slug_categoria: slug,
        tipo_nicho: newCategory.nicho 
      }]);

    if (error) {
      toast.error('Erro ao criar: ' + error.message);
    } else {
      toast.success('Categoria criada com sucesso!');
      setNewCategory({ nome: '', nicho: 'geral' });
      fetchCategories(); // Atualiza a lista na hora
    }
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-zinc-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-black font-montserrat uppercase tracking-tight">Gestão de Catálogo</h2>
          <p className="text-zinc-500 text-sm">Cadastre as categorias e subcategorias mestre do Caruano.</p>
        </div>
        <button 
          onClick={fetchCategories}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Formulário de Criação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 bg-zinc-50 p-4 rounded-xl border border-dashed border-zinc-200">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-600 uppercase ml-1">Nome da Categoria</label>
          <input 
            type="text"
            placeholder="Ex: Alimentos, Moda..."
            className="p-3 rounded-lg border-2 border-zinc-200 focus:border-[#FFC300] outline-none text-black"
            value={newCategory.nome}
            onChange={(e) => setNewCategory({...newCategory, nome: e.target.value})}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-600 uppercase ml-1">Ícone / Nicho</label>
          <select 
            className="p-3 rounded-lg border-2 border-zinc-200 focus:border-[#FFC300] outline-none bg-white text-black min-h-[52px]"
            value={newCategory.nicho}
            onChange={(e) => setNewCategory({...newCategory, nicho: e.target.value})}
          >
            <option value="geral">Geral</option>
            <option value="moda">Moda</option>
            <option value="alimentos">Alimentos</option>
            <option value="servicos">Serviços</option>
          </select>
        </div>
        <button 
          onClick={handleCreateCategory}
          className="bg-[#FFC300] text-black font-bold rounded-lg hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 h-[52px] mt-5"
        >
          <Plus className="w-5 h-5" /> CRIAR CATEGORIA
        </button>
      </div>

      {/* Lista de Categorias com Scroll Corrigido */}
      <div className="space-y-3">
        <h3 className="font-bold text-black flex items-center gap-2 mb-4">
          <FolderTree className="w-5 h-5 text-[#FFC300]" /> Categorias Ativas ({categories.length})
        </h3>
        
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-zinc-100 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((cat: any) => (
              <div key={cat.id} className="flex justify-between items-center p-4 bg-white border border-zinc-200 rounded-xl hover:border-[#FFC300] transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center font-bold text-zinc-400 group-hover:bg-[#FFC300] group-hover:text-black transition-colors">
                    {cat.nome_categoria.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-black">{cat.nome_categoria}</p>
                    <p className="text-xs text-zinc-400 uppercase">{cat.tipo_nicho}</p>
                  </div>
                </div>
                <button className="text-zinc-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-zinc-100 rounded-2xl">
                <p className="text-zinc-400 italic">Nenhuma categoria cadastrada ainda.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}