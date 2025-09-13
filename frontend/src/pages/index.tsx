import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthContext } from "../context/AuthContext";
import NoteCard from "../components/NoteCard";
import { useApiClient } from "../hooks/useApiClient";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();
  const callApi = useApiClient();

  const [notes, setNotes] = useState<Array<{
    id: string;
    title?: string;
    excerpt?: string;
    tags: string[];
    updatedAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      setLoading(true);
      const data = await callApi<{ notes: typeof notes }>("/api/notes");
      setNotes(data.notes || []);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, callApi, router]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  if (!isAuthenticated) {
    return (
      <main className="max-w-4xl mx-auto p-6 bg-parchmentLight rounded-3xl shadow-neu mt-10 text-center text-indigoPulse font-semibold">
        Redirecting to login...
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 bg-parchmentLight rounded-3xl shadow-neu mt-10 min-h-screen">
      <h1 className="text-indigoPulse text-4xl font-extrabold mb-8">Your Notes</h1>

      {loading && <p className="text-indigoPulse font-semibold">Loading notes…</p>}

      {error && (
        <p className="text-neonCoral font-semibold mb-4">
          Error loading notes: {error}
        </p>
      )}

      {!loading && !error && notes.length === 0 && (
        <p className="text-indigoPulse font-medium">
          No notes found.{" "}
          <Link href="/note/new">
            <a className="text-pinkPastel underline hover:text-pinkPastel/80">
              Create a new note
            </a>
          </Link>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </main>
  );
}
