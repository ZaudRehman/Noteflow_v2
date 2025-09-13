import React, { useEffect, useState, useCallback } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { nanoid } from "nanoid";

import SyncIndicator from "./SyncIndicator"; // Sync status with pastel neumorphic styling
import RevisionViewer from "./RevisionViewer"; // Neumorphic toggler for revision panel
import { UserPresence } from "./UserPresence"; // Displays colored collaborator cursors/names

import { useNoteSync } from "../hooks/useNoteSync";
import { useAuthContext } from "../context/AuthContext";

interface EditorProps {
  noteId: string;
  initialContent: string;
  initialTags: string[];
  onContentChange?: (content: string) => void;
  onTagsChange?: (tags: string[]) => void;
  onToggleRevisions?: () => void;
}

const pastelColors = [
  "#a3a1ff", // Pastel Indigo
  "#ffb7ce", // Pastel Pink
  "#a3ffd6", // Mint Green
  "#d4c1ff", // Light Lavender
  "#ff9e9e", // Pale Coral
];

export const Editor: React.FC<EditorProps> = ({
  noteId,
  initialContent,
  initialTags,
  onContentChange,
  onTagsChange,
  onToggleRevisions,
}) => {
  const { user } = useAuthContext();
  const [tags, setTags] = useState<string[]>(initialTags);
  const clientId = React.useRef(nanoid());

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Collaboration.configure({ document: initialContent }),
      CollaborationCursor.configure({
        provider: null, // hooked in useNoteSync
        user: {
          id: clientId.current,
          name: user?.username || "Anonymous",
          color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
        },
      }),
    ],
    content: initialContent,
    onUpdate({ editor }) {
      onContentChange?.(editor.getHTML());
    },
  });

  // Yjs + WebSocket real-time syncing hook
  useNoteSync({ noteId, clientId: clientId.current, editor });

  // Tags handling with local state + propagate
  const handleTagChange = useCallback(
    (newTags: string[]) => {
      setTags(newTags);
      onTagsChange?.(newTags);
    },
    [onTagsChange]
  );

  if (!editor)
    return (
      <div className="text-center py-20 text-pinkPastel select-none font-semibold">
        Loading editor…
      </div>
    );

  return (
    <section className="flex flex-col max-w-4xl mx-auto p-6 bg-parchmentLight rounded-3xl shadow-neu gap-6 min-h-[70vh]">
      {/* Toolbar (top) */}
      <div className="flex justify-between items-center">
        <RevisionToggle
          className="bg-whiteSmoke rounded-xl shadow-neuInner px-5 py-2 cursor-pointer text-indigoPulse hover:shadow-neu transition"
          onToggle={onToggleRevisions}
          aria-label="Toggle revision history panel"
        />
        <SyncStatus
          isSyncing={false}
          collaboratorsOnline={1}
          lastSyncedAt={new Date().toISOString()}
          userNames={[user?.username || ""]}
          className="text-pinkPastel select-none"
        />
      </div>

      {/* Editor and Tag input container */}
      <div className="flex flex-col flex-1 gap-5">
        <div className="flex-1 rounded-3xl shadow-neuInner bg-whiteSmoke p-6 overflow-auto max-h-[50vh] prose prose-indigo pastel-text">
          <EditorContent editor={editor} />
        </div>

        <TagInput
          tags={tags}
          onTagChange={handleTagChange}
          className="bg-whiteSmoke text-indigoPulse rounded-full shadow-neuInner placeholder-indigoPulse px-6 py-3 focus:outline-none focus:ring-2 focus:ring-pinkPastel transition"
          placeholder="Add tags..."
        />
      </div>

      {/* User Presence Display */}
      <UserPresence
        userId={clientId.current}
        colors={pastelColors}
        className="mt-auto"
      />
    </section>
  );
};

export default Editor;