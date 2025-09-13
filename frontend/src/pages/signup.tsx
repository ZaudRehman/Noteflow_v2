import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { signup, loading, error, isAuthenticated } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  if (isAuthenticated) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!username.trim() || !password) {
      setFormError("Username and password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    try {
      await signup(username.trim(), password);
      router.push("/login");
    } catch (err: any) {
      setFormError(err.message || "Signup failed.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-parchmentLight px-4">
      <section className="w-full max-w-md bg-whiteSmoke rounded-3xl shadow-neu p-8">
        <h1 className="text-indigoPulse text-3xl font-extrabold mb-6 text-center">Create Account</h1>

        {formError && (
          <div className="mb-4 rounded-xl bg-neonCoral/80 text-white px-4 py-2 text-center shadow-neuInner">
            {formError}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-neonCoral/80 text-white px-4 py-2 text-center shadow-neuInner">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <label htmlFor="username" className="block text-indigoPulse font-semibold mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full rounded-3xl border border-charcoalFog bg-charcoalFog px-4 py-2 text-snow placeholder-indigoPulse focus:outline-none focus:ring-2 focus:ring-indigoPulse shadow-neuInner"
            disabled={loading}
            required
          />

          <label htmlFor="password" className="block text-indigoPulse font-semibold mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-3xl border border-charcoalFog bg-charcoalFog px-4 py-2 text-snow placeholder-indigoPulse focus:outline-none focus:ring-2 focus:ring-indigoPulse shadow-neuInner"
            disabled={loading}
            required
            minLength={6}
          />

          <label htmlFor="confirmPassword" className="block text-indigoPulse font-semibold mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className="w-full rounded-3xl border border-charcoalFog bg-charcoalFog px-4 py-2 text-snow placeholder-indigoPulse focus:outline-none focus:ring-2 focus:ring-indigoPulse shadow-neuInner"
            disabled={loading}
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigoPulse text-white py-3 rounded-3xl font-semibold shadow-neu hover:bg-indigo600 transition disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-indigoPulse">
          Already have an account?{" "}
          <a href="/login" className="underline hover:text-pinkPastel">
            Log in
          </a>
        </p>
      </section>
    </main>
  );
}
