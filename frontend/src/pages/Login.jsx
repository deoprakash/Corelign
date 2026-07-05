import { useState } from "react";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNotification } from "../context/NotificationContext";
import useApiBase from "../hooks/useApiBase";
import { postJson } from "../lib/api";
import { saveStoredUser } from "../lib/auth";
import AuthShell from "../components/AuthShell";
import { getDeviceInfo } from "../lib/runtime";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/corelignLogo.png";
import { Navigate } from "react-router-dom";

export default function Login() {
  const apiBase = useApiBase();
  const { setView, setCurrentUser } = useContext(AppContext);
  const { push } = useNotification();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    try {
      const deviceInfo = await getDeviceInfo();
      const data = await postJson(`${apiBase}/auth/login`, {
        identifier,
        password,
        device_info: deviceInfo,
      });
      const loggedInUser = {
        ...data.user,
        session_token: data.session_token,
        session_expires_at: data.session_expires_at,
        session_id: data.session_id,
      };
      saveStoredUser(loggedInUser);
      setCurrentUser(loggedInUser);
      setView("home");
      push({
        type: "success",
        title: "Login successful",
        message: `Welcome back, ${data.user.display_name || "User"}.`,
      });
    } catch (error) {
      push({
        type: "error",
        title: "Login failed",
        message: error?.message || "Unable to log in.",
      });
    } finally {
      setStatus("idle");
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-[1600px] px-6 pt-8">
        <Link to="/" className="inline-flex items-center gap-4">
          <img src={logo} alt="Corelign" className="h-16 w-16 object-contain" />

          <div>
            <h1 className="text-3xl font-bold text-slate-800">Corelign</h1>

            <p className="text-sm text-slate-500">
              Intelligent Knowledge Platform
            </p>
          </div>
        </Link>
      </div>

      <AuthShell
        eyebrow="Corelign Access"
        title="Sign in to your workspace"
        subtitle="Use your registered email to access your document intelligence workspace."
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold text-slate-900">Login</p>
            <p className="mt-1 text-sm text-slate-500">
              Access your saved workspaces and uploaded files.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700"
            onClick={() => setView("register")}
          >
            Register
          </button>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-teal-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative mt-2">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? "text" : "password"}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-700 outline-none focus:border-teal-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="mt-2 text-right">
              <button
                type="button"
                className="text-xs font-medium text-teal-700 hover:text-teal-600"
                onClick={() => setView("forgot-password")}
              >
                Forgot password?
              </button>
            </div>
          </div>
          <button
            className="btn-primary w-full justify-center"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Signing in..." : "Login"}
          </button>
          <div className="mt-10 text-center text-300 text-slate-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-teal-600 hover:text-teal-700"
            >
              Register now →
            </button>
          </div>
        </form>
      </AuthShell>
    </>
  );
}
