type PromoMarqueeProps = {
  text?: string;
};

export function PromoMarquee({ text }: PromoMarqueeProps) {
  return (
    <div className="overflow-hidden bg-[#fff48a] text-[11px] font-black uppercase tracking-normal text-neutral-950">
      <div className="mx-auto flex h-9 max-w-[1440px] items-center gap-3 px-4">
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="animate-[caruano-marquee_24s_linear_infinite] whitespace-nowrap">
            {text || "Banner promocional | edita cor, imagem, texto animado se deslocando para esquerda, categorias, lojas, seleciona paginas onde aparece"}
          </div>
        </div>
        <button className="hidden h-5 rounded bg-neutral-950 px-3 text-[9px] font-bold uppercase text-white sm:block">
          Visualizar
        </button>
      </div>
    </div>
  );
}
