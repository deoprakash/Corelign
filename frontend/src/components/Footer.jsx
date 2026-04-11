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
            <p className="mt-3 text-sm text-slate-600">sales@corelign.example</p>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="Twitter" className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200">T</a>
              <a href="#" aria-label="LinkedIn" className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200">in</a>
              <a href="#" aria-label="Github" className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200">G</a>
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
