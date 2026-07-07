import Link from "next/link";

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow mb-3">Legal</p>
        <h1 className="heading-xl mb-3">{title}</h1>
        <p className="mb-2 text-xs uppercase tracking-wider2 text-muted">Last updated: {updated}</p>
        <p className="mb-10 text-sm leading-relaxed text-muted">{intro}</p>

        <nav aria-label="Contents" className="card-luxe mb-12 p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-luxe text-gold-600">Contents</h2>
          <ol className="grid gap-2 text-sm sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <Link href={`#${s.id}`} className="text-navy transition-colors hover:text-gold-700">
                  {i + 1}. {s.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-label={s.title} className="scroll-mt-28">
              <h2 className="heading-md mb-4">
                {i + 1}. {s.title}
              </h2>
              {s.paragraphs.map((p, pi) => (
                <p key={pi} className="mb-3 text-sm leading-relaxed text-ink/90">
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink/90">
                  {s.bullets.map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p className="mt-14 border-t border-line pt-8 text-sm text-muted">
          Questions about this document? Contact us at{" "}
          <a href="mailto:care@leor.sa" className="text-gold-600 hover:text-gold-700">care@leor.sa</a>{" "}
          or via the <Link href="/contact" className="text-gold-600 hover:text-gold-700">contact page</Link>.
        </p>
      </div>
    </div>
  );
}
