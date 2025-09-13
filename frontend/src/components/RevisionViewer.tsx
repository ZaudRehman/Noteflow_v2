import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import rehypeRaw from "rehype-raw";
import { Diff, Hunk, parseDiff } from "react-diff-view";

type Revision = {
  id: string;
  revisionNumber: number;
  bodyHtml: string; // HTML snapshot of note body at this revision
  createdAt: string; // ISO date string
};

type RevisionViewerProps = {
  revisions: Revision[];
  currentBodyHtml: string;
  onRestore: (revisionId: string) => void;
  onClose: () => void;
};

export const RevisionViewer: React.FC<RevisionViewerProps> = ({
  revisions,
  currentBodyHtml,
  onRestore,
  onClose,
}) => {
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);

  // Generate unified diff from two HTML strings (simple line-by-line)
  const generateDiff = (oldText: string, newText: string) => {
    const oldLines = oldText.split("\n");
    const newLines = newText.split("\n");
    const diffLines = [];

    diffLines.push(`--- a/revision.html`);
    diffLines.push(`+++ b/current.html`);

    let i = 0,
      j = 0;

    while (i < oldLines.length || j < newLines.length) {
      if (oldLines[i] === newLines[j]) {
        diffLines.push(` ${oldLines[i] || ""}`);
        i++;
        j++;
      } else if (oldLines[i] && !newLines.includes(oldLines[i])) {
        diffLines.push(`-${oldLines[i]}`);
        i++;
      } else if (newLines[j] && !oldLines.includes(newLines[j])) {
        diffLines.push(`+${newLines[j]}`);
        j++;
      } else {
        diffLines.push(` ${oldLines[i] || ""}`);
        i++;
        j++;
      }
    }
    return diffLines.join("\n");
  };

  // Render diff view using react-diff-view library
  const renderDiff = () => {
    if (!selectedRevision) return <p className="text-pinkPastel select-none">Select a revision to preview.</p>;

    const diffText = generateDiff(selectedRevision.bodyHtml, currentBodyHtml);
    const files = parseDiff(diffText);
    if (files.length === 0) return <p className="text-pinkPastel select-none">No differences found.</p>;

    return (
      <>
        {files.map(({ hunks }) =>
          hunks.map((hunk) => (
            <Hunk key={hunk.content} hunk={hunk} />
          ))
        )}
      </>
    );
  };

  return (
    <section className="bg-parchmentLight rounded-3xl shadow-neu p-6 max-w-4xl mx-auto text-textLight">
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-indigoPulse text-xl font-semibold">Revision History</h2>
        <button
          onClick={onClose}
          aria-label="Close revision history"
          className="text-pinkPastel hover:text-indigoPulse rounded focus:outline-none focus:ring-2 focus:ring-indigoPulse"
        >
          ✕
        </button>
      </header>

      {revisions.length === 0 ? (
        <p className="text-pinkPastel select-none">No revisions available.</p>
      ) : (
        <nav className="mb-6 flex flex-col space-y-2 max-h-48 overflow-y-auto">
          {revisions.map((rev) => {
            const isSelected = selectedRevision?.id === rev.id;
            return (
              <button
                onClick={() => setSelectedRevision(rev)}
                key={rev.id}
                aria-pressed={isSelected}
                className={`text-left rounded-lg px-4 py-2 cursor-pointer select-none transition ${
                  isSelected
                    ? "bg-indigoPulse text-white shadow-neuInner font-semibold"
                    : "bg-whiteSmoke text-charcoalFog hover:bg-neonCoral/20"
                }`}
              >
                Revision {rev.revisionNumber} - {formatDistanceToNow(new Date(rev.createdAt), { addSuffix: true })}
              </button>
            );
          })}
        </nav>
      )}

      <article className="bg-whiteSmoke rounded-2xl p-4 prose max-h-72 overflow-auto mb-6" dangerouslySetInnerHTML={{ __html: selectedRevision?.bodyHtml || "" }} />

      {selectedRevision && (
        <button
          onClick={() => onRestore(selectedRevision.id)}
          className="w-full py-3 rounded-3xl bg-emeraldGlow hover:bg-emeraldGlow/90 text-snowDrift shadow-md transition font-semibold"
          aria-label="Restore selected revision"
        >
          Restore this version
        </button>
      )}
    </section>
  );
};

export default RevisionViewer;