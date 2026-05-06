import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import ScrollReveal, { ScrollRevealGroup } from '../components/ScrollReveal'

const DOWNLOAD_LINKS = {
  windows: 'https://coreligndownloads.blob.core.windows.net/downloads/Corelign%20Desktop%20Setup%201.0.0.exe',
  linux: 'https://coreligndownloads.blob.core.windows.net/downloads/corelign-desktop_1.0.0_amd64.deb',
}

const coreFeatures = [
  { 
    title: 'Hybrid Retrieval', 
    description: 'Dense semantic + sparse keyword search for precise, contextual answers',
    icon: '🔍'
  },
  { 
    title: 'Source-Grounded Answers', 
    description: 'Every response includes linked citations to original documents',
    icon: '📄'
  },
  { 
    title: 'Workspace-Based Knowledge', 
    description: 'Organize and manage multiple document collections effortlessly',
    icon: '📁'
  },
  { 
    title: 'Multi-Document Understanding', 
    description: 'Cross-reference insights across your entire knowledge base',
    icon: '🔗'
  },
  { 
    title: 'Model Selection', 
    description: 'Switch between auto-optimized and manual LLM configurations',
    icon: '⚙️'
  },
]

const windowsFeatures = [
  { title: 'Native Windows Integration', description: 'Seamless integration with Windows 10 and 11' },
  { title: 'Easy Installation', description: 'Simple MSI installer with one-click setup' },
  { title: 'System Tray Support', description: 'Quick access from Windows system tray' },
  { title: 'Windows Defender Verified', description: 'Verified safe by Windows Defender SmartScreen' },
]

const linuxFeatures = [
  { title: 'Ubuntu/Debian Compatible', description: 'Works on Ubuntu 20.04 LTS and newer' },
  { title: 'Lightweight & Fast', description: 'Minimal resource consumption on Linux systems' },
  { title: 'Command Line Tools', description: 'Full CLI support for advanced users' },
  { title: 'Package Management', description: 'Install via apt package manager' },
]

const handleDownload = (platform) => {
  const link = DOWNLOAD_LINKS[platform]

  // Trigger from a real user click path; this works more reliably for Drive-hosted files.
  const anchor = document.createElement('a')
  anchor.href = link
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

const demoMessages = [
  { role: 'user', text: 'Which contracts require 30-day notice?' },
  { role: 'assistant', text: 'Contracts 4.2 and 5.1 include a 30-day written notice clause for termination.' },
]

export default function Download() {
  return (
    <PageTransition>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-50/50 via-white/50 to-orange-50/50 p-8 sm:p-12 lg:p-16">
          <ScrollReveal className="relative z-10 mx-auto max-w-4xl" direction="up">
            <div className="text-center">
              <h1 className="font-display text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                Corelign <span className="block text-teal-600 sm:text-4xl">Your Private AI Knowledge Engine</span>
              </h1>
              <p className="mt-6 text-xl text-slate-600">
                Upload documents. Ask questions. Get answers with sources.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleDownload('windows')}
                className="btn-primary glow-accent inline-flex items-center gap-2"
                data-analytics="download-hero-button"
              >
                <span>↓</span> Download
              </button>
              <Link to="/workspace" className="btn-ghost micro-pill inline-flex items-center gap-2" data-analytics="download-view-demo">
                <span>▶</span> View Demo
              </Link>
            </div>

            {/* Demo Preview */}
            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {/* Query Input */}
              <ScrollReveal direction="left" className="glass interactive-card rounded-2xl p-6">
                <p className="mb-4 text-sm font-semibold text-slate-600">Upload your documents</p>
                <div className="rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/50 p-6 text-center">
                  <p className="text-sm text-slate-600">Drag & drop documents or click to browse</p>
                  <p className="mt-1 text-xs text-slate-500">PDF, DOCX, TXT</p>
                  <button className="btn-primary mt-4 text-sm" data-analytics="download-browse-files">Browse Files</button>
                </div>
                
                <div className="mt-6 space-y-2">
                  <div className="micro-pill flex items-center gap-2 rounded-lg bg-teal-50/70 px-4 py-3">
                    <span className="text-teal-600">✓</span>
                    <span className="text-sm text-slate-700">Policy Handbook.pdf</span>
                  </div>
                  <div className="micro-pill flex items-center gap-2 rounded-lg bg-teal-50/70 px-4 py-3">
                    <span className="text-teal-600">✓</span>
                    <span className="text-sm text-slate-700">Product Brief.docx</span>
                  </div>
                  <div className="micro-pill flex items-center gap-2 rounded-lg bg-teal-50/70 px-4 py-3">
                    <span className="text-teal-600">✓</span>
                    <span className="text-sm text-slate-700">Compliance Guide.pdf</span>
                  </div>
                </div>
              </ScrollReveal>

              {/* Answer with Sources Preview */}
              <ScrollReveal direction="right" className="glass interactive-card rounded-2xl p-6">
                <p className="mb-4 text-sm font-semibold text-slate-600">Get answers with sources</p>
                <div className="space-y-4">
                  {/* User Query */}
                  <div className="flex justify-end">
                    <div className="max-w-xs rounded-2xl rounded-tr-none bg-teal-600 px-4 py-3 text-white">
                      <p className="text-sm">{demoMessages[0].text}</p>
                    </div>
                  </div>

                  {/* AI Answer */}
                  <div className="flex justify-start">
                    <div className="max-w-xs space-y-2">
                      <div className="rounded-2xl rounded-tl-none bg-slate-100 px-4 py-3">
                        <p className="text-sm text-slate-900">{demoMessages[1].text}</p>
                      </div>
                      {/* Sources */}
                      <div className="space-y-2 pl-2">
                        <p className="text-xs font-semibold text-slate-600">Sources:</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="micro-pill inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs text-slate-600">
                            📄 Policy Handbook · Section 5
                          </span>
                          <span className="micro-pill inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs text-slate-600">
                            📄 Contracts · Appendix B
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid gap-3 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Confidence Score</span>
                    <span className="font-semibold text-teal-600">98.5%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[98.5%] bg-teal-500 transition-all duration-500 hover:w-full" />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </ScrollReveal>

          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-teal-200/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-orange-200/20 blur-3xl" />
        </div>

        {/* Core Features Section */}
        <div>
          <ScrollReveal className="text-center mb-12" direction="up">
            <h2 className="font-display text-4xl font-semibold text-slate-900 sm:text-5xl">Product Intelligence</h2>
            <p className="mt-4 text-lg text-slate-600">Enterprise-grade AI knowledge engine with advanced retrieval</p>
          </ScrollReveal>

          <ScrollRevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.06} direction="up">
            {coreFeatures.map((feature) => (
              <div key={feature.title} className="glass interactive-card rounded-2xl p-6">
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </ScrollRevealGroup>
        </div>

        {/* Download Section */}
        <ScrollReveal className="text-center" direction="up">
          <h2 className="font-display text-4xl font-semibold text-slate-900 sm:text-5xl">Download Corelign</h2>
          <p className="mt-4 text-lg text-slate-600">Get the desktop application for your operating system</p>
        </ScrollReveal>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Windows Section */}
          <ScrollReveal direction="left">
            <div className="glass interactive-card rounded-3xl p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-xl">🪟</span>
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-slate-900">Windows</h2>
                  <p className="text-sm text-slate-600">Windows 7+</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="rounded-xl bg-white/80 p-4">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Version:</span> 1.0.0
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">File Size:</span> 80 MB
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Format:</span> Portable Executable (.exe)
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-900 mb-3">Features</p>
                <div className="space-y-2">
                  {windowsFeatures.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{feature.title}</p>
                        <p className="text-xs text-slate-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleDownload('windows')}
                className="btn-primary glow-accent w-full"
                data-analytics="download-windows"
              >
                Download for Windows
              </button>
            </div>
          </ScrollReveal>

          {/* Linux Section */}
          <ScrollReveal direction="right">
            <div className="glass interactive-card rounded-3xl p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <span className="text-xl">🐧</span>
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-slate-900">Linux</h2>
                  <p className="text-sm text-slate-600">Ubuntu 20.04+ & Debian</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="rounded-xl bg-white/80 p-4">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Version:</span> 1.0.0
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">File Size:</span> 78 MB
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Format:</span> Debian Package (.deb)
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-900 mb-3">Features</p>
                <div className="space-y-2">
                  {linuxFeatures.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{feature.title}</p>
                        <p className="text-xs text-slate-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleDownload('linux')}
                className="btn-primary glow-accent w-full"
                data-analytics="download-linux"
              >
                Download for Linux
              </button>
            </div>
          </ScrollReveal>
        </div>

        {/* System Requirements */}
        <ScrollReveal className="glass rounded-3xl p-8" direction="up">
          <h3 className="font-display text-2xl font-semibold text-slate-900 mb-6">System Requirements</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Windows</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-teal-600">✓</span>
                  Windows 10 (build 1909) or newer
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600">✓</span>
                  2 GB RAM minimum (4 GB recommended)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600">✓</span>
                  500 MB free disk space
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600">✓</span>
                  .NET Framework 4.7.2 or newer
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Linux</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-teal-600">✓</span>
                  Ubuntu 20.04 LTS or Debian 10+
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600">✓</span>
                  2 GB RAM minimum (4 GB recommended)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600">✓</span>
                  500 MB free disk space
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600">✓</span>
                  glibc 2.31 or newer
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* Installation Guide */}
        <ScrollReveal className="glass rounded-3xl p-8" direction="up">
          <h3 className="font-display text-2xl font-semibold text-slate-900 mb-6">Installation Guide</h3>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Windows Installation</h4>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">1</span>
                  <span>Download the .exe file</span>
                </li>
                <li className="flex gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">2</span>
                  <span>Double-click the installer</span>
                </li>
                <li className="flex gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">3</span>
                  <span>Follow the installation wizard</span>
                </li>
                <li className="flex gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">4</span>
                  <span>Launch from Start Menu or Desktop shortcut</span>
                </li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Linux Installation</h4>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">1</span>
                  <span>Download the .deb file</span>
                </li>
                <li className="flex gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">2</span>
                  <span className="font-mono text-xs bg-slate-900 text-white px-2 py-1 rounded">sudo apt install ./corelign-app.deb</span>
                </li>
                <li className="flex gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">3</span>
                  <span>Launch from Applications menu</span>
                </li>
              </ol>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </PageTransition>
  )
}
