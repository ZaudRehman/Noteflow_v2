import { useEffect, useRef, useCallback } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Editor } from "@tiptap/react";

type UseNoteSyncProps = {
  noteId: string;
  editor: Editor | null;
  clientId: string;
};

export function useNoteSync({ noteId, editor, clientId }: UseNoteSyncProps) {
  const ydocRef = useRef<Y.Doc>();
  const providerRef = useRef<WebsocketProvider>();

  // Initialize Y.Doc and WebSocket provider for collaboration
  useEffect(() => {
    if (!noteId || !editor) return;
    
    // Cleanup old instance if exists
    if (providerRef.current) {
      providerRef.current.destroy();
      ydocRef.current?.destroy();
      providerRef.current = undefined;
      ydocRef.current = undefined;
    }

    // Create Y doc and provider
    const ydoc = new Y.Doc();
    const wsUrl = `wss://your-backend-domain/api/notes/${noteId}/ws`; // Update with your real WS URL

    // Setup Yjs provider - adapt your backend WS URL accordingly
    const provider = new WebsocketProvider(wsUrl, noteId, ydoc, {
      params: { clientId },
      connect: true,
      // Optional: retry settings, awareness, custom awareness map, etc.
      // awareness: new awarenessProtocol.Awareness(ydoc),
    });

    ydocRef.current = ydoc;
    providerRef.current = provider;

    // Bind Yjs document to editor content for real-time syncing
    const yXmlFragment = ydoc.getXmlFragment("prosemirror");

    editor.commands.setContent(yXmlFragment.toString()).catch(() => {});

    editor.registerPlugin(Y.syncPlugin(yXmlFragment));
    editor.registerPlugin(Y.cursorPlugin(provider.awareness));

    provider.on("status", ({ status }) => {
      console.log(`[YJS] provider status: ${status}`);
    });

    provider.on("sync", (isSynced) => {
      console.log(`[YJS] synced: ${isSynced}`);
      // Optionally indicate sync state in UI
    });

    // Cleanup on unmount or noteId/editor change
    return () => {
      provider.disconnect();
      provider.destroy();
      ydoc.destroy();
    };
  }, [noteId, editor, clientId]);

  // Send local editor changes to WebSocket
  const sendChange = useCallback(
    (content: string) => {
      if (!providerRef.current || !ydocRef.current) return;

      // Update Yjs doc - in practice handled by Yjs bindings, so may be unused here

      // Example: ydocRef.current.getText("prosemirror").insert(0, content);
    },
    []
  );

  return {
    sendChange,
  };
}
