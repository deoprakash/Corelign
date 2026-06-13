import React from 'react'
import PageTransition from '../components/PageTransition'
import ScrollReveal, { ScrollRevealGroup } from '../components/ScrollReveal'
import deo from '../assets/deo.jpg'
import arya from '../assets/arya.jpeg'

export default function AboutUs() {
  return (
    <PageTransition>
      <ScrollReveal className="glass rounded-3xl p-8" direction="up">
        <h1 className="font-display text-6xl font-semibold text-slate-900 text-center">
          Corelign
        </h1>
        <h3 className="font-display mt-4 text-2xl font-light text-slate-700 text-center">
          Turn document chaos into business clarity
        </h3>

        <p className="mt-4 text-slate-600 text-justify">
          Every organization sits on a goldmine of knowledge — locked inside PDFs,
          manuals, contracts, and reports. Corelign unlocks it in seconds. Ask a
          question, get the answer, and see exactly where it came from. No digging.
          No guesswork. Just clarity.
        </p>

        <p className="mt-4 text-slate-600 text-justify">
          Built for teams that move fast and cannot afford wrong answers — from
          growing businesses and enterprise operations to industrial environments
          managing critical documentation at scale.
        </p>

        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-slate-800">What Corelign Is</h3>
          <p className="text-sm text-slate-600 text-justify">
            Corelign is your organization&apos;s document intelligence layer — turning
            static files into a living knowledge base your whole team can query in
            plain language. Upload what you already have, ask the way you would in a
            meeting, and get answers drawn directly from your own materials, with
            full traceability back to the source. It is the difference between
            documents that sit on a shelf and knowledge that drives decisions.
          </p>

          <h3 className="font-semibold text-slate-800">Why Teams Choose Corelign</h3>
          <ul className="list-inside list-disc text-sm text-slate-600 space-y-1 text-justify">
            <li>
              <strong>Move faster:</strong> Cut hours of manual document review down
              to seconds — and redirect that time toward growth.
            </li>
            <li>
              <strong>Reduce risk:</strong> Every answer comes with source references,
              built for teams that need accountability and audit-ready confidence.
            </li>
            <li>
              <strong>Scale knowledge:</strong> Onboard faster, resolve customer
              queries quicker, and keep teams aligned without repeating the same
              research.
            </li>
            <li>
              <strong>No rip-and-replace:</strong> Works with the PDFs and Word files
              your business already runs on — start where you are.
            </li>
            <li>
              <strong>Decide with confidence:</strong> Replace uncertainty with
              answers your team can verify on the spot.
            </li>
            <li>
              <strong>Built to grow:</strong> From a single team&apos;s document library
              to organization-wide knowledge — Corelign scales with your ambition.
            </li>
          </ul>

          <h3 className="font-semibold text-slate-800">Who It&apos;s For</h3>
          <ul className="list-inside list-disc text-sm text-slate-600 space-y-1 text-justify">
            <li>
              <strong>Enterprises &amp; growing businesses</strong> — policies, SOPs,
              project reports, and internal knowledge, always within reach.
            </li>
            <li>
              <strong>Industrial &amp; operations teams</strong> — safety manuals,
              compliance documents, equipment guides, and maintenance records,
              accessible on the floor or in the field.
            </li>
            <li>
              <strong>Customer-facing teams</strong> — resolve inquiries faster with
              accurate answers pulled straight from product and policy documentation.
            </li>
            <li>
              <strong>Legal &amp; compliance</strong> — trace every response back to
              the exact clause, regulation, or procedure that supports it.
            </li>
            <li>
              <strong>Leadership &amp; investors</strong> — see knowledge move from
              locked-in documents to measurable team productivity and sharper
              decision-making.
            </li>
          </ul>

          <h3 className="font-semibold text-slate-800">Our Vision</h3>
          <p className="text-sm text-slate-600 text-justify">
            The future of work is not about reading more documents — it is about
            accessing the right information at the right moment. Corelign is building
            that future: where every organization&apos;s knowledge works as hard as the
            people behind it.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="font-display text-2xl font-semibold text-slate-900 text-center">
            Project Developers
          </h2>
          <p className="mt-2 text-sm text-slate-500 text-center">
            Meet the team behind this project.
          </p>

          <ScrollRevealGroup
            className="mt-6 grid gap-6 sm:grid-cols-2"
            stagger={0.06}
            direction="up"
          >
            <div className="flex flex-col items-center text-center gap-1 rounded-2xl bg-white/80 p-6 mt-5">
              <img
                src={deo}
                alt="Deo Prakash"
                className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover"
              />
              <p className="font-semibold text-xl text-slate-900">
                Deo Prakash
              </p>
              <p className="text-s text-slate-500">
                Associate Software Developer
              </p>
              <div className="mt-2 flex items-center gap-3 text-slate-600">
                <a
                  href="https://www.linkedin.com/in/deo-prakash-152265225"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Deo LinkedIn"
                  className="hover:text-slate-900"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0zM8 8h4.8v2.3h.1c.7-1.3 2.4-2.6 4.9-2.6C22 7.7 24 9.6 24 13.8V24h-5v-9.5c0-2.3-.8-3.8-2.7-3.8-1.5 0-2.4 1-2.8 2-0.1.2-.1.5-.1.8V24H8V8z" />
                  </svg>
                </a>
                <a
                  href="mailto:deoprakash364@gmail.com"
                  aria-label="Deo Email"
                  className="hover:text-slate-900"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 13.5L0 6V18a2 2 0 002 2h20a2 2 0 002-2V6l-12 7.5zM12 11L0 3h24L12 11z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/deoprakash"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Deo GitHub"
                  className="hover:text-slate-900"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .5C5.7.5.8 5.4.8 11.7c0 5 3.3 9.2 7.9 10.7.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.4-3.9-1.4-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1 1.7.8 2.1 1.2.1-.8.4-1.4.7-1.7-2.6-.3-5.3-1.3-5.3-5.9 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.4.1-2.9 0 0 1-.3 3.3 1.2.9-.2 1.9-.4 2.9-.4 1 0 2 .2 2.9.4 2.3-1.5 3.3-1.2 3.3-1.2.6 1.5.2 2.6.1 2.9.8.9 1.2 1.9 1.2 3.2 0 4.6-2.7 5.6-5.3 5.9.4.3.8 1 .8 2.1v3.1c0 .3.2.7.8.6 4.6-1.5 7.9-5.7 7.9-10.7C23.2 5.4 18.3.5 12 .5z" />
                  </svg>
                </a>
              </div>
              <p className="mt-3 text-sm text-slate-600 text-justify">
                AI Engineer with hands-on experience in designing and deploying
                real-world Artificial Intelligence solutions across Generative
                AI, Large Language Models (LLMs), Retrieval-Augmented Generation
                (RAG), deep learning, and intelligent automation. Skilled in
                building scalable AI systems, including conversational
                assistants, multimodal applications, workflow automation
                platforms, and edge-deployed machine learning models. <br /> <br /> My work
                spans diverse domains such as healthcare, industrial defect
                detection, customer support automation, and enterprise AI
                solutions. I have experience developing end-to-end AI products,
                from data processing and model training to cloud deployment and
                production integration. Passionate about research-driven
                innovation, I focus on bridging the gap between cutting-edge AI
                advancements and practical business applications, creating
                intelligent systems that deliver measurable real-world impact.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-1 rounded-2xl bg-white/80 p-6 mt-5">
              <img
                src={arya}
                alt="Arya Singh"
                className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover"
              />
              <p className="font-semibold text-xl text-slate-900">Arya Singh</p>
              <p className="text-s text-slate-500">AI Engineer</p>
              <div className="mt-2 flex items-center gap-3 text-slate-600">
                <a
                  href="https://www.linkedin.com/in/arya-singh-3558a5256/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Arya LinkedIn"
                  className="hover:text-slate-900"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0zM8 8h4.8v2.3h.1c.7-1.3 2.4-2.6 4.9-2.6C22 7.7 24 9.6 24 13.8V24h-5v-9.5c0-2.3-.8-3.8-2.7-3.8-1.5 0-2.4 1-2.8 2-0.1.2-.1.5-.1.8V24H8V8z" />
                  </svg>
                </a>
                <a
                  href="mailto:aryasingh1320@gmail.com"
                  aria-label="Arya Email"
                  className="hover:text-slate-900"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 13.5L0 6V18a2 2 0 002 2h20a2 2 0 002-2V6l-12 7.5zM12 11L0 3h24L12 11z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/AryaSingh-25"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Arya GitHub"
                  className="hover:text-slate-900"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .5C5.7.5.8 5.4.8 11.7c0 5 3.3 9.2 7.9 10.7.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.4-3.9-1.4-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1 1.7.8 2.1 1.2.1-.8.4-1.4.7-1.7-2.6-.3-5.3-1.3-5.3-5.9 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.4.1-2.9 0 0 1-.3 3.3 1.2.9-.2 1.9-.4 2.9-.4 1 0 2 .2 2.9.4 2.3-1.5 3.3-1.2 3.3-1.2.6 1.5.2 2.6.1 2.9.8.9 1.2 1.9 1.2 3.2 0 4.6-2.7 5.6-5.3 5.9.4.3.8 1 .8 2.1v3.1c0 .3.2.7.8.6 4.6-1.5 7.9-5.7 7.9-10.7C23.2 5.4 18.3.5 12 .5z" />
                  </svg>
                </a>
              </div>
              <p className="mt-3 text-sm text-slate-600 text-justify">
                I am a final-year Computer Science Engineering student
                specializing in Artificial Intelligence, with hands-on
                experience in building real-world AI systems. My work spans deep
                learning, LLM applications, and multimodal AI, including
                projects in healthcare, industrial defect detection, and
                intelligent automation. Currently working as an AI Engineer, I
                focus on developing scalable solutions such as RAG pipelines,
                LLM-driven assistants, and edge-deployed models. I am deeply
                interested in research-driven innovation, aiming to build
                impactful systems that bridge the gap between AI theory and
                practical deployment.
              </p>
            </div>
          </ScrollRevealGroup>
        </div>
      </ScrollReveal>
    </PageTransition>
  );
}
