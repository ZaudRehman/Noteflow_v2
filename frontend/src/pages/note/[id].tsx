import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useAuthContext } from "../../context/AuthContext";
import { useApiClient } from "../../hooks/useApiClient";
import Editor from "../../components/Editor";
import AIInsightsPanel from "../../components/AIInsightsPanel";
import RevisionViewer from "../../components/RevisionViewer";
import ShareModal from "../../components/ShareModal";
import SyncIndicator from "../../components/SyncIndicator";
import UserPresence from "../../components/UserPresence";

const pastelColors = [
  "#a3a1ff", // Pastel Indigo
  "#ffb7ce", // Pastel Pink
  "#a3ffd6", // Mint Green
  "#d4c1ff", // Light Lavender
  "#ff9e9e", // Pale Coral
];

export default function NotePage() {
  const router = useRouter();
  const { id: noteId } = router.query;
  const { user, token } = useAuthContext();
  const callApi = useApiClient();

  const [noteContent, setNoteContent] = useState<string>("");
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [showRevisions, setShowRevisions] = useState(false);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");

  // Ref for editor instance
  const editorRef = useRef<any>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  // Fetch note details on mount and noteId changes
  const fetchNote = useCallback(async () => {
    if (!noteId || typeof noteId !== "string" || !token) return;
    try {
      const data = await callApi<{ content: string; tags: string[] }>(`/api/notes/${noteId}`);
      setNoteContent(data.content);
      setNoteTags(data.tags);
      setShareLink(`${window.location.origin}/note/${noteId}?share=1`);
    } catch (err) {
      console.error("Failed to load note:", err);
    }
  }, [noteId, token, callApi]);

  // Fetch revisions when toggled
  const fetchRevisions = useCallback(async () => {
    if (!noteId || typeof noteId !== "string" || !token) return;
    try {
      const data = await callApi<any[]>(`/api/notes/${noteId}/revisions`);
      setRevisions(data);
    } catch (err) {
      console.error("Failed to load revisions:", err);
    }
  }, [noteId, token, callApi]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  useEffect(() => {
    if (showRevisions) {
      fetchRevisions();
    }
  }, [showRevisions, fetchRevisions]);

  const handleContentChange = (content: string) => {
    setNoteContent(content);
    // Optional: debounce save or websocket notify
  };

  const handleTagsChange = (tags: string[]) => {
    setNoteTags(tags);
    // Optional: sync tags backend here or debounce
  };

  const toggleRevisions = () => {
    setShowRevisions((v) => !v);
  };

  const openShareModal = () => setShareModalOpen(true);
  const closeShareModal = () => setShareModalOpen(false);

  const handleShare = async (emails: string[], role: "viewer" | "editor", expiryDays?: number) => {
    if (!noteId) return;
    try {
      await callApi(`/api/notes/${noteId}/share`, {
        method: "POST",
        body: { emails, role, expiryDays },
      });
      alert("Invitations sent successfully!");
      closeShareModal();
    } catch (err) {
      alert("Failed to send invites.");
      console.error(err);
    }
  };

  const handleRestoreRevision = async (revisionId: string) => {
    if (!token || !noteId) return;
    try {
      const res = await fetch(`/api/notes/${noteId}/revisions/${revisionId}/restore`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Restore failed");
      const restoredNote = await res.json();
      setNoteContent(restoredNote.body || restoredNote.content || "");
      setShowRevisions(false);
      if (editorInstance?.commands?.setContent) {
        editorInstance.commands.setContent(restoredNote.body || restoredNote.content || "");
      }
    } catch {
      alert("Failed to restore revision");
    }
  };

  if (!user || !noteContent) return <p className="p-6 text-center text-indigoPulse">Loading...</p>;

  return (
    <main className="flex flex-col md:flex-row max-w-7xl mx-auto p-6 gap-8 min-h-screen bg-parchmentLight rounded-3xl shadow-neu">
      {/* Left column: Editor and presence */}
      <section className="md:flex-1 flex flex-col gap-6">
        <Editor
          noteId={noteId as string}
          initialContent={noteContent}
          initialTags={noteTags}
          onContentChange={handleContentChange}
          onTagsChange={handleTagsChange}
          onToggleRevisions={toggleRevisions}
          ref={setEditorInstance}
        />
        <UserPresence userId={user.id} colors={pastelColors} className="mt-4" />
        <SyncIndicator
          isSyncing={false} // Integrate real status here
          collaboratorsOnline={1}
          lastSyncedAt={new Date().toISOString()}
          userNames={[user.username]}
          className="text-pinkPastel select-none"
        />
      </section>

      {/* Right column: AI Insights, RevisionViewer, ShareModal */}
      <aside className="w-full md:w-96 flex flex-col gap-6">
        <AIInsightsPanel
          summary="" // Optionally fetch and pass AI summary here
          suggestedTags={noteTags}
          onAddTag={(tag) => {
            const newTags = Array.from(new Set([...noteTags, tag]));
            handleTagsChange(newTags);
          }}
          onRefine={() => alert("Refine AI summary to be implemented")}
          onSendToChatGPT={() => alert("Send to ChatGPT to be implemented")}
          saving={false}
        />

        {showRevisions && (
          <RevisionViewer
            revisions={revisions}
            currentBodyHtml={noteContent}
            onRestore={handleRestoreRevision}
            onClose={toggleRevisions}
          />
        )}

        <button
          onClick={openShareModal}
          className="mt-auto rounded-3xl bg-indigoPulse text-snow py-3 font-bold shadow-neu hover:bg-indigo600 transition"
          aria-label="Open share modal"
        >
          Share Note
        </button>

        {shareModalOpen && (
          <ShareModal
            isOpen={shareModalOpen}
            onClose={closeShareModal}
            onShare={handleShare}
            shareLink={shareLink}
          />
        )}
      </aside>
    </main>
  );
}
