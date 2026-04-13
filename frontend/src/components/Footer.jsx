import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/corelignLogo.png'

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white/50">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-6 py-10 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center">
              <img src={logo} alt="Corelign" className="object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Corelign</p>
              <p className="text-xs text-slate-500">Intelligent RAG Platform</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600">
            Turn your internal documents into searchable, auditable answers — with secure access
            controls and end-to-end traceability.
          </p>

          <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-700">Contact</a>
            <span>·</span>
            <a href="#" className="hover:text-slate-700">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-slate-700">Terms</a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <p className="text-xs font-semibold text-slate-500">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-slate-900">Features</a></li>
              <li><a href="#" className="hover:text-slate-900">Integrations</a></li>
              <li><a href="#" className="hover:text-slate-900">API</a></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500">Resources</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-slate-900">Docs</a></li>
              <li><a href="#" className="hover:text-slate-900">Blog</a></li>
              <li><a href="#" className="hover:text-slate-900">Security</a></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link to="/about" className="hover:text-slate-900">About</Link></li>
              <li><Link to="/workspace" className="hover:text-slate-900">Workspace</Link></li>
              <li><Link to="/contact" className="hover:text-slate-900">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500">Get in touch</p>
            <p className="mt-3 text-center text-sm text-slate-600">deoprakash364@gmail.com</p>
            <div className="mt-4 flex justify-center gap-3 text-slate-500">
              <a href="https://www.linkedin.com/in/deo-prakash-152265225" target="_blank" rel="noreferrer" aria-label="Deo LinkedIn" className="transition-colors hover:text-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0zM8 8h4.8v2.3h.1c.7-1.3 2.4-2.6 4.9-2.6C22 7.7 24 9.6 24 13.8V24h-5v-9.5c0-2.3-.8-3.8-2.7-3.8-1.5 0-2.4 1-2.8 2-0.1.2-.1.5-.1.8V24H8V8z"/></svg>
              </a>
                <a href="mailto:deoprakash364@gmail.com" aria-label="Deo Email" className="transition-colors hover:text-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 13.5L0 6V18a2 2 0 002 2h20a2 2 0 002-2V6l-12 7.5zM12 11L0 3h24L12 11z"/></svg>
                </a>
                <a href="https://github.com/deoprakash" target="_blank" rel="noreferrer" aria-label="Deo GitHub" className="transition-colors hover:text-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.8 5.4.8 11.7c0 5 3.3 9.2 7.9 10.7.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.4-3.9-1.4-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1 1.7.8 2.1 1.2.1-.8.4-1.4.7-1.7-2.6-.3-5.3-1.3-5.3-5.9 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.4.1-2.9 0 0 1-.3 3.3 1.2.9-.2 1.9-.4 2.9-.4 1 0 2 .2 2.9.4 2.3-1.5 3.3-1.2 3.3-1.2.6 1.5.2 2.6.1 2.9.8.9 1.2 1.9 1.2 3.2 0 4.6-2.7 5.6-5.3 5.9.4.3.8 1 .8 2.1v3.1c0 .3.2.7.8.6 4.6-1.5 7.9-5.7 7.9-10.7C23.2 5.4 18.3.5 12 .5z"/></svg>
                </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-6 py-4">
        <div className="mx-auto max-w-[1600px] text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Corelign. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
