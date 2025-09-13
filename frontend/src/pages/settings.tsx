import React, { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/router";

const THEMES = {
  light: "light",
  dark: "dark",
};

export default function SettingsPage() {
  const { user: authContextUser } = useAuthContext();
  const { user, token, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  // Determine initial profile name prioritizing AuthContext user if available
  const initialProfileName = authContextUser?.username ?? user?.username ?? "";

  const [profileName, setProfileName] = useState(initialProfileName);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("noteflow_theme");
      if (savedTheme === THEMES.light || savedTheme === THEMES.dark) {
        return savedTheme;
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? THEMES.dark : THEMES.light;
    }
    return THEMES.light;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Sync theme class and localStorage on theme change
  useEffect(() => {
    document.documentElement.classList.remove(THEMES.light, THEMES.dark);
    document.documentElement.classList.add(theme);
    localStorage.setItem("noteflow_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === THEMES.dark ? THEMES.light : THEMES.dark));
  };

  async function handleProfileUpdate() {
    if (!user || !token) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: profileName }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      setSuccessMsg("Profile updated successfully!");
    } catch (e: any) {
      setError(e.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccountDelete() {
    if (!user || !token) return;
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Account deletion failed");

      logout();
      router.push("/signup");
    } catch (e: any) {
      setError(e.message || "Deletion failed");
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-3xl mx-auto p-6 bg-parchmentLight rounded-3xl shadow-neu mt-10 text-center text-indigoPulse font-semibold">
        Redirecting to login...
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 bg-parchmentLight rounded-3xl shadow-neu mt-10">
      <h1 className="text-indigoPulse text-3xl font-extrabold mb-6">Settings</h1>

      {error && (
        <div className="mb-4 rounded-xl bg-neonCoral/80 text-snow px-4 py-2 text-center shadow-neuInner">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 rounded-xl bg-mintPastel/80 text-charcoal px-4 py-2 text-center shadow-neuInner">
          {successMsg}
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-indigoPulse text-xl font-semibold mb-2">User Information</h2>
        <p className="text-charcoal mb-4">
          Username: <strong>{authContextUser?.username ?? user?.username}</strong>
        </p>
        <label htmlFor="username" className="block mb-2 font-semibold text-indigoPulse">
          Update Username
        </label>
        <input
          id="username"
          type="text"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          className="w-full rounded-3xl border border-charcoalFog bg-charcoalFog px-3 py-2 text-snow focus:outline-none focus:ring-2 focus:ring-indigoPulse"
          disabled={loading}
        />
        <button
          onClick={handleProfileUpdate}
          disabled={loading}
          className="mt-4 w-full rounded-3xl bg-indigoPulse text-snow py-2 font-semibold shadow-neu hover:bg-indigo-600 transition disabled:opacity-50"
        >
          Save Changes
        </button>
      </section>

      <section className="mb-8">
        <h2 className="text-indigoPulse text-xl font-semibold mb-3">Appearance</h2>
        <button
          onClick={toggleTheme}
          className="rounded-3xl bg-whiteSmoke px-6 py-2 font-semibold shadow-neuInner hover:shadow-neu focus:outline-none focus:ring-2 focus:ring-indigoPulse text-indigoPulse"
        >
          Switch to {theme === THEMES.dark ? "Light" : "Dark"} Mode
        </button>
      </section>

      <section>
        <h2 className="text-indigoPulse text-xl font-semibold mb-3">Danger Zone</h2>
        <button
          onClick={handleAccountDelete}
          disabled={loading}
          className="rounded-3xl bg-neonCoral text-snow px-6 py-2 font-semibold shadow-neu hover:bg-red-700 transition disabled:opacity-50"
        >
          Delete Account
        </button>
      </section>
    </main>
  );
}
