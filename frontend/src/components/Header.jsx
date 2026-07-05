import { useState, useContext, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import logo from "../assets/corelignLogo.png";
import { useLocation } from "react-router-dom";

export default function Header({ authPage = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { currentUser, logout } = useContext(AppContext);

  const profileRef = useRef(null);

  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-slate-900"
      : "text-slate-600 transition-colors hover:text-slate-900";

  const mobileLinkClass = ({ isActive }) =>
    [
      "rounded-2xl px-4 py-3 transition-colors",
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    ].join(" ");

  const initials =
    currentUser?.display_name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase() ||
    currentUser?.email?.charAt(0).toUpperCase() ||
    "U";

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {!isAuthPage && (
        <header className="relative z-50 mx-auto w-full max-w-[1600px] px-4 pb-4 pt-6 sm:px-6 sm:pt-8">
          <div className="relative z-50 rounded-3xl border border-white/60 bg-white/70 px-4 py-4 shadow-lg shadow-slate-900/5 backdrop-blur-xl sm:px-5">
            <div className="flex items-center  justify-between ">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center sm:h-12 sm:w-12">
                  <img src={logo} alt="Corelign" className="object-contain" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-700 sm:text-xl">
                    Corelign
                  </p>
                  <p className="text-[11px] text-slate-400 sm:text-xs">
                    Intelligent Knowledge Platform
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 md:hidden"
                aria-label={
                  isMenuOpen ? "Close navigation menu" : "Open navigation menu"
                }
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setIsMenuOpen((open) => !open)}
              >
                {isMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                  </svg>
                )}
              </button>

              <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                <NavLink
                  to="/"
                  end
                  className={linkClass}
                  data-analytics="nav-home"
                >
                  Home
                </NavLink>
                <NavLink
                  to="/about"
                  className={linkClass}
                  data-analytics="nav-about"
                >
                  About Us
                </NavLink>
                <NavLink
                  to="/workspace"
                  className={linkClass}
                  data-analytics="nav-workspace"
                >
                  Workspace
                </NavLink>
                <NavLink
                  to="/insights"
                  className={linkClass}
                  data-analytics="nav-insights"
                >
                  Insights
                </NavLink>
                <NavLink
                  to="/download"
                  className={linkClass}
                  data-analytics="nav-download"
                >
                  Download
                </NavLink>

                {currentUser ? (
                  <div ref={profileRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-95"
                      title={`${currentUser.display_name || "User"}`}
                      aria-expanded={isProfileOpen}
                      aria-haspopup="menu"
                    >
                      {initials}
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                        <div className="border-b border-slate-100 px-4 py-3">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {currentUser.display_name || "User"}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {currentUser.email}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            console.log("Logout button clicked");
                            setIsProfileOpen(false);
                            logout();
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className="btn-ghost"
                      data-analytics="nav-login"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="btn-primary"
                      data-analytics="nav-register"
                    >
                      Register
                    </NavLink>
                  </>
                )}
                <NavLink
                  to="/book-demo"
                  className="btn-primary"
                  data-analytics="nav-book-demo"
                >
                  Book a demo
                </NavLink>
              </nav>
            </div>

            <div
              id="mobile-navigation"
              className={`grid overflow-hidden transition-all duration-300 ease-out md:hidden ${
                isMenuOpen
                  ? "mt-4 grid-rows-[1fr] opacity-100"
                  : "mt-0 grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0">
                <nav className="flex flex-col gap-2 border-t border-slate-200/80 pt-4 text-sm font-medium">
                  <NavLink
                    to="/"
                    end
                    className={mobileLinkClass}
                    onClick={() => setIsMenuOpen(false)}
                    data-analytics="mobile-nav-home"
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/about"
                    className={mobileLinkClass}
                    onClick={() => setIsMenuOpen(false)}
                    data-analytics="mobile-nav-about"
                  >
                    About Us
                  </NavLink>
                  <NavLink
                    to="/workspace"
                    className={mobileLinkClass}
                    onClick={() => setIsMenuOpen(false)}
                    data-analytics="mobile-nav-workspace"
                  >
                    Workspace
                  </NavLink>
                  <NavLink
                    to="/insights"
                    className={mobileLinkClass}
                    onClick={() => setIsMenuOpen(false)}
                    data-analytics="mobile-nav-insights"
                  >
                    Insights
                  </NavLink>
                  <NavLink
                    to="/download"
                    className={mobileLinkClass}
                    onClick={() => setIsMenuOpen(false)}
                    data-analytics="mobile-nav-download"
                  >
                    Download
                  </NavLink>
                  {currentUser ? (
                    <button
                      type="button"
                      className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      onClick={() => {
                        console.log("Mobile logout button clicked");
                        setIsMenuOpen(false);
                        logout();
                      }}
                      data-analytics="mobile-nav-logout"
                    >
                      Logout
                    </button>
                  ) : (
                    <>
                      <NavLink
                        to="/login"
                        className={mobileLinkClass}
                        onClick={() => setIsMenuOpen(false)}
                        data-analytics="mobile-nav-login"
                      >
                        Login
                      </NavLink>
                      <NavLink
                        to="/register"
                        className={mobileLinkClass}
                        onClick={() => setIsMenuOpen(false)}
                        data-analytics="mobile-nav-register"
                      >
                        Register
                      </NavLink>
                    </>
                  )}
                  <NavLink
                    to="/book-demo"
                    className="btn-primary mt-2 justify-center"
                    onClick={() => setIsMenuOpen(false)}
                    data-analytics="mobile-nav-book-demo"
                  >
                    Book a demo
                  </NavLink>
                </nav>
              </div>
            </div>
          </div>
        </header>
      )}
    </>
  );
}
