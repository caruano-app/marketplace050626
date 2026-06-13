'use client';
import React from 'react';
import Link from 'next/link';

export default function ProductCard({ product }: any) {
  if (!product) return null;
  return (
    <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all">
      <div className="aspect-square bg-zinc-100 rounded-xl mb-4 overflow-hidden">
        {product.imagens_url?.[0] && (
          <img src={product.imagens_url[0]} alt={product.nome_produto} className="w-full h-full object-cover" />
        )}
      </div>
      <h3 className="font-bold text-zinc-800 text-sm mb-2">{product.nome_produto}</h3>
      <p className="text-lg font-black text-black">R$ {product.preco_base_varejo}</p>
      <Link href={`/product/${product.id}`} className="mt-4 block text-center bg-black text-white text-[10px] font-bold py-2 rounded-lg uppercase tracking-widest">Ver Detalhes</Link>
    </div>
  );
}

export { ProductCard };
