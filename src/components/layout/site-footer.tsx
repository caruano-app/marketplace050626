import { getAdminAppearanceConfig, type FooterLink } from "@/lib/data/admin-appearance";

const paymentBadges = ["McAfee", "Norton", "Visa", "Mastercard", "Pix", "Skrill", "PayPal"];

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="mb-3 text-2xl font-black">{title}</h2>
      <ul className="space-y-2 text-lg">
        {links.map((link) => (
          <li key={`${title}-${link.label}-${link.href}`}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function SiteFooter() {
  const appearance = await getAdminAppearanceConfig();
  const footer = appearance.footer;

  return (
    <footer className="mt-4 bg-[#ffd700] text-neutral-950">
      <div className="mx-auto grid max-w-[1412px] gap-10 px-10 py-12 md:grid-cols-[1fr_1fr_1.2fr_1.8fr]">
        <FooterColumn links={footer.institucional} title="Institucional" />
        <FooterColumn links={footer.ajuda} title="Ajuda" />
        <FooterColumn links={footer.linksUteis} title="Links Uteis" />

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

      <div className="bg-[#d6aa2a] py-3 text-center text-sm">{footer.copyright}</div>
    </footer>
  );
}
