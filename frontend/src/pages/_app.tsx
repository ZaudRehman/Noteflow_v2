import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import { useEffect, useState, createContext, useContext } from "react";
import { Inter, Roboto_Slab } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-roboto-slab',
  display: 'swap',
});

// Create a context to provide theme and toggle function
const ThemeContext = createContext<{
  theme: string;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<string>("light");

  // On initial load, set theme from localStorage or system preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedTheme = localStorage.getItem("noteflow_theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  // Apply theme class to document.documentElement and persist selection
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem("noteflow_theme", theme);
    }
  }, [theme]);

  // Theme toggling function
  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthProvider>
      <main
          className={`${inter.variable} ${robotoSlab.variable} font-inter`}
        >
          <Component {...pageProps} />
        </main>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}
