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
    if (!newSub.nome ||!newSub.paiId) return alert('Preencha os campos');
    const slug = newSub.nome.toLowerCase().trim().replace(/\s+/g, '-');
    const { error } = await supabase.from('subcategorias_mestre').insert([
      { categoria_pai_id: newSub.paiId, nome_subcategoria: newSub.nome, slug_subcategoria: slug }
    ]);
    if (error) alert('Erro: ' + error.message);
    else { alert('Sucesso!'); setNewSub({ nome: '', paiId: '' }); loadData(); }
  }

  return (
    
      Gestão de Catálogo

      
        {/* Criar Categoria */}
        
          Nova Categoria Mestre
           setNewCat({...newCat, nome: e.target.value})}
          />
          
            CRIAR CATEGORIA
          
        

        {/* Criar Subcategoria */}
        
          Nova Subcategoria
           setNewSub({...newSub, paiId: e.target.value})}
          >
            Selecionar Categoria Pai...
            {categories.map((c: any) => (
              {c.nome_categoria}
            ))}
          
           setNewSub({...newSub, nome: e.target.value})}
          />
          
            CRIAR SUBCATEGORIA
          
        

      

      {/* Lista de Categorias */}
      
        Categorias Ativas
        
          {categories.map((c: any) => (
            
              {c.nome_categoria}

              
                {c.subcategorias_mestre?.map((s: any) => (
                  
                    • {s.nome_subcategoria}
                  

                ))}
              

            

          ))}
        


      

    
  );
}
