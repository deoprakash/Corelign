import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function FeedbackPopup() {
    const [open, setOpen] = useState(false);

    const [formData, setFormData] = useState({
        source: "",
        feedback: "",
        rating: 0,
        email: "",
    });

    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const alreadySubmitted = localStorage.getItem(
        "corelign_feedback_submitted",
        );

    if (alreadySubmitted === "true") return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

    const handleSubmit = async () => {
        try {
            const visitorId = localStorage.getItem("visitorId");

                if (!formData.feedback.trim()) {
                alert("Please provide feedback.");
                return;
                }

                if (!formData.email.trim()) {
                alert("Please enter your email.");
                return;
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailRegex.test(formData.email)) {
                alert("Please enter a valid email address.");
                return;
                }

                if (formData.rating === 0) {
                alert("Please select a rating.");
                return;
                }

        const response = await fetch(`${API_BASE}/analytics/feedback`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            visitor_id: visitorId,
            source: formData.source,
            feedback: formData.feedback,
            rating: formData.rating,
            email: formData.email,
            }),
        });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      localStorage.setItem("corelign_feedback_submitted", "true");

      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Unable to submit feedback.");
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl text-center">
          <div className="mb-4 text-5xl">🎉</div>

          <h2 className="mb-3 text-2xl font-bold text-slate-900">Thank You!</h2>

          <p className="mb-8 text-slate-600">
            Thank you for your valuable feedback. Your suggestions help us
            improve Corelign and build a better experience.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => {
                setSubmitted(false);
                setOpen(false);
              }}
              className="rounded-lg bg-slate-900 px-8 py-3 text-white transition hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="mb-2 text-2xl font-bold">👋 Help us improve Corelign</h2>

        <p className="mb-6 text-gray-600">
          Your feedback directly influences what we build next.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-medium">
              How did you discover us?
            </label>

            <select
              className="w-full rounded border p-2"
              value={formData.source}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  source: e.target.value,
                })
              }
            >
              <option value="">Select</option>
              <option value="Google">Google</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="GitHub">GitHub</option>
              <option value="Reddit">Reddit</option>
              <option value="Twitter">Twitter / X</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">
              What's the most valuable improvement we can make?
            </label>

            <textarea
              rows={4}
              className="w-full rounded border p-2"
              placeholder="Share your feedback..."
              value={formData.feedback}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  feedback: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Rate your experience <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      rating: star,
                    })
                  }
                  className="transition-all duration-200 hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-10 w-10"
                    fill={star <= formData.rating ? "#FACC15" : "white"}
                    stroke="#FACC15"
                    strokeWidth="2"
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 22L12 18.56L5.82 22L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </button>
              ))}
            </div>

            {/* <div className="mt-2 text-sm text-slate-500">
              {formData.rating > 0
                ? `Selected Rating: ${formData.rating}/5`
                : "Click a star to rate"}
            </div> */}
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Email <span className="text-red-500">*</span>
            </label>

            <input
              type="email"
              required
              className="w-full rounded border p-2"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
            >
              Submit Feedback
            </button>

            <button
              onClick={() => setOpen(false)}
              className="rounded border px-4 py-2"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
