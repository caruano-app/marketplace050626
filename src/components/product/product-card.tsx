'use client';
import React from 'react';
import Link from 'next/link';

export default function ProductCard({ product }: any) {
  return (
    <div className="group bg-white border border-transparent hover:border-zinc-200 hover:shadow-xl transition-all duration-300 p-3 rounded-xl">
      {/* Imagem */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100 mb-4">
        <img 
          src={product.imagens_url?.[0] || '/placeholder.png'} 
          alt={product.nome_produto}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.is_partner && (
          <span className="absolute top-2 left-2 bg-[#FFC300] text-[10px] font-black px-2 py-0.5 rounded uppercase">Parceiro</span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
          {product.lojistas?.nome_fantasia || 'Caruano'}
        </p>
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm text-zinc-800 font-medium line-clamp-2 leading-snug group-hover:text-[#FFC300] transition-colors">
            {product.nome_produto}
          </h3>
        </Link>
        
        <div className="pt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-black">
            R$ {product.preco_base_varejo}
          </span>
          {product.preco_unitario_atacado && (
            <span className="text-[10px] text-emerald-600 font-bold uppercase">Atacado</span>
          )}
        </div>
      </div>

      {/* Botão sutil que aparece no hover (Desktop) ou fixo (Mobile) */}
      <button className="mt-4 w-full bg-zinc-900 text-white text-xs font-bold py-3 rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 uppercase tracking-widest">
        Adicionar
      </button>
    </div>
  );
}
