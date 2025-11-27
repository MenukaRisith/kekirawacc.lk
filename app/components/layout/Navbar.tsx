// app/components/layout/Navbar.tsx
import { NavLink } from "@remix-run/react";
import { useState } from "react";

const links = [
  { name: "HOME", to: "/" },
  { name: "ABOUT", to: "/about"},
  { name: "HISTORY", to: "/history" },
  { name: "NEWS", to: "/news" },
  { name: "LIFE AT KCC", to: "/life-at-kcc" },
  { name: "ACADEMICS", to: "/academics" },
  { name: "CLUBS & SOCIETIES", to: "/clubs" },
  { name: "SPORTS", to: "/sports" },
  { name: "CONTACT US", to: "/contact" }
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <img
              src="/branding/logo.png"
              alt="School Logo"
              className="h-16 w-auto object-contain"
            />
            <span className="font-semibold text-lg text-black hidden sm:block">
              {/* School name (optional) */}
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-m font-medium transition ${
                    isActive
                      ? "text-[#800000] border-b-2 border-[#800000] pb-1"
                      : "text-gray-800 hover:text-[#800000]"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-black p-2 rounded-md hover:bg-gray-100 transition"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-7 w-7 transform transition-transform duration-200 ${
                open ? "rotate-90" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu DROPDOWN (fixed overlay, fade/slide) */}
      <nav
        className={`
          lg:hidden fixed inset-x-0 top-20 z-40
          bg-white border-b border-gray-200 shadow-md
          transition-all duration-200 ease-out
          ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}
        `}
      >
        <div className="px-4 py-3 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `
                  block text-m font-medium py-2
                  transition-all duration-200
                  ${
                    isActive
                      ? "text-[#800000] border-l-4 border-[#800000] pl-3 bg-gray-50"
                      : "text-gray-800 hover:text-[#800000] hover:pl-3"
                  }
                `
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
