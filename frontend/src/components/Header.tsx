import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthContext } from "../context/AuthContext";

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="bg-parchmentLight shadow-neu rounded-b-3xl flex items-center justify-between px-6 py-3 max-w-full">
      <Link href="/" passHref>
        <a className="text-indigoPulse font-extrabold text-2xl select-none">Noteflow</a>
      </Link>

      <nav className="relative" ref={menuRef}>
        {isAuthenticated ? (
          <>
            <button
              id="user-menu-button"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center space-x-2 rounded-xl bg-whiteSmoke px-4 py-2 shadow-neuInner hover:shadow-neu text-indigoPulse font-semibold focus:outline-none focus:ring-2 focus:ring-indigoPulse transition"
            >
              <span>{user?.username || "Anonymous"}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  menuOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-40 bg-parchmentLight rounded-3xl shadow-neuInner ring-1 ring-black ring-opacity-5 z-50"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabIndex={-1}
              >
                <Link href="/settings" passHref>
                  <a
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => setMenuOpen(false)}
                    className="block px-5 py-3 text-indigoPulse hover:bg-indigoPulse hover:text-white rounded-3xl transition select-none"
                  >
                    Settings
                  </a>
                </Link>

                <button
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-5 py-3 text-neonCoral hover:bg-indigoPulse hover:text-white rounded-3xl transition select-none"
                >
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex space-x-6">
            <Link href="/login" passHref>
              <a className="text-indigoPulse hover:underline font-semibold select-none">Login</a>
            </Link>
            <Link href="/signup" passHref>
              <a className="text-indigoPulse hover:underline font-semibold select-none">Sign Up</a>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
