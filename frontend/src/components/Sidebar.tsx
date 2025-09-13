import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "My Notes", href: "/notes" },
  { label: "Shared With Me", href: "/shared" },
  { label: "AI Summaries", href: "/ai-summaries" },
  { label: "Settings", href: "/settings" },
];

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Hamburger button - mobile only */}
      <button
        aria-label="Toggle sidebar"
        className="fixed top-4 left-4 z-50 md:hidden bg-charcoal rounded-lg p-2 text-snow transition-shadow shadow-neu hover:shadow-neuInner focus:outline-none focus:ring-2 focus:ring-indigo-400"
        onClick={toggleSidebar}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-parchmentLight shadow-neu rounded-tr-3xl rounded-br-3xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative`}
        aria-label="Main navigation"
      >
        <div className="h-20 flex items-center justify-center border-b border-charcoal">
          <span className="text-indigo-700 text-2xl font-extrabold cursor-default select-none">
            Noteflow
          </span>
        </div>
        <nav className="flex flex-col p-6 space-y-3 overflow-y-auto h-[calc(100vh-5rem)]">
          {navItems.map(({ label, href }) => {
            const isActive = router.pathname === href || router.pathname.startsWith(href + "/");
            return (
              <Link key={label} href={href} passHref>
                <a
                  aria-current={isActive ? "page" : undefined}
                  className={`block rounded-lg px-4 py-3 font-semibold text-lg truncate transition ${
                    isActive
                      ? "bg-indigo-200 text-indigo-800 shadow-neuInner"
                      : "text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700"
                  }`}
                  onClick={() => setIsOpen(false)} // close sidebar on link click (mobile)
                >
                  {label}
                </a>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay behind sidebar on small screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
