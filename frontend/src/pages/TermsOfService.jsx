import React from 'react';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';

export default function TermsOfService() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <ScrollReveal direction="up">
          <h1 className="font-display text-4xl font-semibold text-slate-900">Terms of Service</h1>
          <p className="mt-4 text-slate-500">Effective Date: {new Date().toLocaleDateString()}</p>

          <div className="mt-8 space-y-8 text-slate-600">
            <section>
              <h2 className="text-2xl font-semibold text-slate-800">1. Acceptance of Terms</h2>
              <p className="mt-3">
                By accessing or using Corelign (the "Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800">2. AI Output Disclaimer & Limitation of Liability</h2>
              <p className="mt-3">
                Corelign utilizes advanced artificial intelligence (AI) and Retrieval-Augmented Generation technology to provide insights based on your documents. While we strive for high accuracy ("near zero hallucination"), AI-generated output can occasionally contain errors or misinterpretations.
              </p>
              <p className="mt-3 font-semibold text-slate-800">
                You acknowledge and agree that you must independently verify any critical answers provided by the Platform. Corelign and its creators are NOT liable for any business, legal, financial, or operational decisions made based on the AI's output. The service is provided "as is" without warranty of any kind.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800">3. User Content & Intellectual Property</h2>
              <p className="mt-3">
                <strong>Your Content:</strong> You retain all ownership rights to the documents, texts, and data you upload to the Platform. By uploading content, you grant us a temporary, limited license solely to process, parse, and vector-embed this data to provide the service to you.
              </p>
              <p className="mt-3">
                <strong>Your Responsibility:</strong> You represent and warrant that you have all necessary rights, licenses, and permissions to upload the content, and that such content does not violate any third-party intellectual property rights or confidentiality agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800">4. Acceptable Use Policy</h2>
              <p className="mt-3">
                You agree not to use the Platform to:
              </p>
              <ul className="mt-3 list-disc pl-5 space-y-2">
                <li>Upload illegal, defamatory, highly restricted (without authorization), or harmful content.</li>
                <li>Attempt to reverse-engineer, decompile, or hack the Platform's source code or underlying AI models.</li>
                <li>Use automated scripts or scrapers to extract data from the Platform.</li>
                <li>Use the service in any way that violates applicable local, national, or international cyber laws.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800">5. Limitation of Liability & Indemnification</h2>
              <p className="mt-3">
                To the maximum extent permitted by law, Corelign shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your use or inability to use the Platform; (b) any unauthorized access to or alteration of your transmissions or content.
              </p>
              <p className="mt-3">
                You agree to indemnify and hold harmless Corelign, its developers, and affiliates from any claims, damages, or legal expenses arising from your violation of these Terms or your uploaded content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800">6. Service Availability & Termination</h2>
              <p className="mt-3">
                We continuously strive to maintain optimal uptime, but we do not guarantee that the Platform will be available 100% of the time. We reserve the right to suspend or terminate your access to the Platform at our sole discretion, without prior notice, if you violate these Terms or engage in activities that harm our systems or other users.
              </p>
            </section>
          </div>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
