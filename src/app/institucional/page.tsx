import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="bg-[#FFC300] py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-black mb-6 font-montserrat">
          SEU BOX NO AGRESTE AGORA É UMA LOJA PARA O MUNDO
        </h1>
        <p className="text-xl text-black/80 max-w-2xl mx-auto mb-10">
          A plataforma que entende o jeito de fazer negócio de Caruaru, Toritama e Santa Cruz. 
          Venda no atacado e varejo com tecnologia de gigante.
        </p>
        <button className="bg-black text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition">
          QUERO DIGITALIZAR MINHA LOJA
        </button>
      </section>

      {/* Recursos Section */}
      <section className="py-20 max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-12">
        <div className="text-center">
          <div className="text-4xl mb-4 text-[#FFC300]">🖨️</div>
          <h3 className="font-bold text-xl mb-2 font-montserrat">Etiqueta Térmica</h3>
          <p className="text-gray-600">Imprima etiquetas de envio direto do seu celular no box da feira.</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4 text-[#FFC300]">🚌</div>
          <h3 className="font-bold text-xl mb-2 font-montserrat">Logística Regional</h3>
          <p className="text-gray-600">Integrado com excursões, vans e motoboys para entrega rápida.</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4 text-[#FFC300]">📊</div>
          <h3 className="font-bold text-xl mb-2 font-montserrat">Inteligência B2B</h3>
          <p className="text-gray-600">Saiba quando seu estoque está acabando e compre direto das distribuidoras.</p>
        </div>
      </section>
    </div>
  );
}