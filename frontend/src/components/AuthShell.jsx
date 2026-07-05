import PageTransition from './PageTransition'

export default function AuthShell({ eyebrow, title, subtitle, children }) {
  return (
    <PageTransition>
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <div className="glass relative overflow-hidden rounded-[32px] p-8 lg:p-10">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-teal-200/70 blur-2xl" />
          <div className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-orange-200/70 blur-2xl" />

          <div className="relative">
            <p className="pill bg-teal-50 text-teal-700">{eyebrow}</p>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">{subtitle}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white/70 p-5">
                <p className="text-sm font-semibold text-slate-900">Secure sessions</p>
                <p className="mt-2 text-sm text-slate-600">Passwords are hashed before they reach MongoDB.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 p-5">
                <p className="text-sm font-semibold text-slate-900">Workspace ready</p>
                <p className="mt-2 text-sm text-slate-600">Accounts are linked to the same RAG workspace flow.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-[32px] p-6 sm:p-8">{children}</div>
      </section>
    </PageTransition>
  )
}
