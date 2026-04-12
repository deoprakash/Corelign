import { useState } from 'react'
import PageTransition from '../components/PageTransition'
import ScrollReveal from '../components/ScrollReveal'
import { useNotification } from '../context/NotificationContext'
import useApiBase from '../hooks/useApiBase'
import { postJson } from '../lib/api'

const initialFormState = {
  name: '',
  email: '',
  contactNumber: '',
  message: '',
}

export default function BookDemo() {
  const apiBase = useApiBase()
  const [formData, setFormData] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { push } = useNotification()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await postJson(`${apiBase}/demo-request`, {
        name: formData.name,
        email: formData.email,
        contact_number: formData.contactNumber,
        message: formData.message,
      })

      push({
        type: 'success',
        title: 'Demo request sent',
        message: 'Thanks! Our team will contact you shortly.',
      })

      setFormData(initialFormState)
    } catch (error) {
      push({
        type: 'error',
        title: 'Submission failed',
        message: error?.message || 'Could not submit demo request.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <ScrollReveal className="glass mx-auto w-full max-w-3xl rounded-3xl p-8 sm:p-10" direction="up">
        <h1 className="font-display text-3xl font-semibold text-slate-900">Book a Demo</h1>
        <p className="mt-3 text-slate-600">
          Tell us a bit about your needs and we will schedule a walkthrough.
        </p>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              placeholder="Your full name"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-5">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                placeholder="you@company.com"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="contactNumber">
                Contact Number
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                placeholder="+1 555 123 4567"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              placeholder="Share your use case and preferred timeline"
            />
          </div>

          <div className="pt-2">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit request'}
            </button>
          </div>
        </form>
      </ScrollReveal>
    </PageTransition>
  )
}
