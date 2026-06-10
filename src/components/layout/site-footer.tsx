const paymentBadges = ["McAfee", "Norton", "Visa", "Mastercard", "Pix", "Skrill", "PayPal"];

export function SiteFooter() {
  return (
    <footer className="mt-4 bg-[#ffd700] text-neutral-950">
      <div className="mx-auto grid max-w-[1412px] gap-10 px-10 py-12 md:grid-cols-[1fr_1fr_1.2fr_1.8fr]">
        <div>
          <h2 className="mb-3 text-2xl font-black">Institucional</h2>
          <ul className="space-y-2 text-lg">
            <li><a href="/sobre">Sobre o Caruano</a></li>
            <li><a href="/criar-loja">Seja Lojista</a></li>
            <li><a href="/contato">Contato</a></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-2xl font-black">Ajuda</h2>
          <ul className="space-y-2 text-lg">
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/trocas-e-devolucoes">Trocas e Devolucoes</a></li>
            <li><a href="/prazos-de-entrega">Prazos de Entrega</a></li>
            <li><a href="/frete">Frete</a></li>
            <li><a href="/rastrear-pedido">Rastrear Pedido</a></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-2xl font-black">Links Uteis</h2>
          <ul className="space-y-2 text-lg">
            <li><a href="/nota-da-moda">Nota da Moda</a></li>
            <li><a href="/blog">Bolg</a></li>
            <li><a href="/servicos-em-destaques">Servicos em Destaques</a></li>
            <li><a href="/lojas-premium">Lojas Premium</a></li>
            <li><a href="/entrevistas">Entrevistas</a></li>
            <li><a href="/lives">Lives</a></li>
          </ul>
        </div>

        <div className="space-y-8">
          <form className="flex h-12 w-full max-w-[520px]">
            <label className="sr-only" htmlFor="newsletter-email">Digite seu E-mail</label>
            <input
              className="min-w-0 flex-1 bg-white px-5 text-base outline-none placeholder:text-neutral-400"
              id="newsletter-email"
              placeholder="Digite seu E-mail:"
              type="email"
            />
            <button className="bg-neutral-950 px-8 text-base font-bold text-white" type="button">
              Inscreva-se
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {paymentBadges.map((badge) => (
              <span className="grid h-9 min-w-20 place-items-center rounded-[2px] bg-white px-3 text-sm font-black" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#d6aa2a] py-3 text-center text-sm">
        Caruano | caruano.com - Direitos reservados
      </div>
    </footer>
  );
}
