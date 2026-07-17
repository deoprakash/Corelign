import { Link } from 'react-router-dom'
import { stats, features } from '../constants'
import PageTransition from '../components/PageTransition'
import ScrollReveal, { ScrollRevealGroup } from '../components/ScrollReveal'

export default function Home() {
  return (
    <PageTransition>
      <section className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hero-grid rounded-[32px] p-10 lg:p-12">
          <ScrollReveal className="inline-block pill bg-teal-50 text-teal-700" direction="left">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
            Live indexing enabled
          </ScrollReveal>

          <ScrollReveal direction="up" className="mt-6">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Turn complex documents into instant, confident answers.
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.06} className="mt-4 max-w-xl">
            <p className="text-base text-slate-600 sm:text-lg">
              Corelign organizes your enterprise knowledge, preserves context, and delivers fast answers grounded in
              your most trusted documents.
            </p>
          </ScrollReveal>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ScrollReveal direction="up" delay={0.12}>
              <Link className="btn-primary inline-flex items-center" to="/workspace" data-analytics="home-start-indexing">
                Start indexing
              </Link>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.14}>
              <button className="btn-ghost" data-analytics="home-security-brief">See security brief</button>
            </ScrollReveal>
          </div>
          <ScrollRevealGroup className="mt-10 grid gap-4 sm:grid-cols-3" stagger={0.06} direction="up">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl px-5 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </ScrollRevealGroup>
        </div>

        <div className="relative">
          <ScrollReveal className="glass animate-fadeUp rounded-[28px] p-6 shadow-glow" direction="right">
            <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Document Upload</p>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">Secure</span>
            </div>
              <div className="mt-6 rounded-2xl border border-dashed border-teal-200 bg-teal-50/60 p-6 text-center">
                <p className="text-sm font-medium text-slate-700">Drag & drop or browse</p>
                <p className="text-xs text-slate-500">Supports PDF & DOCX</p>
                <button className="btn-primary mt-5" data-analytics="home-upload-file">Upload file</button>
              </div>

              <ScrollRevealGroup className="mt-6 space-y-4" stagger={0.04} direction="up">
                {['Policy Handbook.pdf', 'Product Brief.docx', 'Compliance Guide.pdf'].map((doc) => (
                  <div key={doc} className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{doc}</p>
                      <p className="text-xs text-slate-400">Processing · 72%</p>
                    </div>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-3/4 bg-teal-500" />
                    </div>
                  </div>
                ))}
              </ScrollRevealGroup>
            </div>
          </ScrollReveal>

          <div className="absolute -right-10 -top-8 hidden h-32 w-32 animate-float rounded-[28px] bg-orange-200/70 blur-xl md:block" />
          <div className="absolute -bottom-10 -left-6 hidden h-28 w-28 animate-float rounded-full bg-teal-200/80 blur-2xl md:block" />
        </div>
      </section>

      <section id="capabilities" className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass rounded-3xl p-8">
          <p className="pill bg-orange-50 text-orange-600">Built for teams</p>
          <h2 className="mt-4 font-display text-3xl font-semibold text-slate-900">Everything your team needs in one interface.</h2>
          <p className="mt-4 text-slate-600">Connect your documents, manage team access, and unlock instant knowledge in minutes with enterprise-grade security.</p>
          <div className="mt-6 grid gap-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-white/80 bg-white/70 p-5">
                <p className="text-sm font-semibold text-slate-900">{feature.title}</p>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="glass rounded-3xl p-7">
            <p className="text-xs uppercase tracking-wide text-slate-400">Realtime query</p>
            <p className="mt-4 text-lg font-semibold text-slate-900">"Which contracts require 30-day notice?"</p>
            <div className="mt-5 rounded-2xl bg-slate-900 p-5 text-sm text-slate-200">
              <p className="font-medium text-white">Answer</p>
              <p className="mt-2 text-slate-300">Contracts 4.2 and 5.1 include a 30-day written notice clause for termination.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/10 px-3 py-1">Policy Handbook · Section 5</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Contracts · Appendix B</span>
              </div>
            </div>
          </div>
          <div className="glass grid gap-4 rounded-3xl p-7 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Priority queues</p>
              <p className="mt-2 text-xs text-slate-500">Schedule high impact docs first.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Access controls</p>
              <p className="mt-2 text-xs text-slate-500">Role-based routing & approvals.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about-corelign" className="space-y-8">
        <div className="glass rounded-3xl p-8 lg:p-10">
          <ScrollReveal direction="up">
            <p className="pill bg-teal-50 text-teal-700">AI Document Assistant</p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-slate-900">
              Powered by Advanced RAG Technology
            </h2>
            <p className="mt-4 text-slate-600">
              Corelign transforms your static documents into a conversational knowledge base. Simply upload your PDFs and Word files, and instantly get precise, reliable answers with near zero hallucination—making it essential for professionals who need accurate information fast.
            </p>
          </ScrollReveal>
        </div>

        <div>
          <h3 className="mb-6 font-display text-2xl font-semibold text-slate-900">Key Features</h3>
          <ScrollRevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06} direction="up">
            {[
              {
                title: 'Smart Contextual Search',
                description: 'Finds exactly what you mean, not just what you type, for highly relevant results.',
              },
              {
                title: 'Near Zero Hallucination',
                description: 'Delivers highly accurate and reliable answers you can trust for critical business decisions.',
              },
              {
                title: 'Verifiable Answers',
                description: 'Every response is backed by clear source references and exact citations from your files.',
              },
              {
                title: 'Workspace Management',
                description: 'Organize and manage your team\'s knowledge efficiently across different projects.',
              },
              {
                title: 'Enterprise Reliability',
                description: 'Built to handle your organization\'s growing needs with fast and secure performance.',
              },
              {
                title: 'Multi-Format Support',
                description: 'Seamlessly works with the PDFs, Word documents, and files you already use every day.',
              },
            ].map((feature) => (
              <div key={feature.title} className="glass rounded-2xl p-6">
                <p className="font-semibold text-slate-900">{feature.title}</p>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </ScrollRevealGroup>
        </div>
      </section>
    </PageTransition>
  )
}
