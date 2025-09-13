import React from "react";
import { formatDistanceToNow } from "date-fns";

interface NoteCardProps {
  id: string;
  title?: string;
  excerpt?: string;
  tags?: string[];
  revision?: number | null;
  updatedAt?: string; // ISO timestamp
  onEdit?: (id: string) => void;
  onShare?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  id,
  title,
  excerpt,
  tags = [],
  revision,
  updatedAt,
  onEdit,
  onShare,
  onDelete,
}) => {
  const updatedDistance = updatedAt
    ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true })
    : "Unknown";

  return (
    <article
      className="bg-parchmentLight rounded-3xl shadow-neu p-6 hover:shadow-neuInner transition cursor-pointer max-w-md w-full flex flex-col"
      aria-label={`Note titled ${title || "Untitled"}`}
      role="article"
    >
      {/* Header */}
      <header className="mb-2 flex justify-between items-center">
        <h2 className="text-indigoPulse font-semibold text-xl truncate">
          {title || "Untitled"}
        </h2>
        <div className="text-sm text-pinkPastel select-none">
          Rev {typeof revision === "number" ? revision : "—"}
        </div>
      </header>

      {/* Excerpt */}
      <section className="flex-1 mb-4 text-gray-600 prose max-w-full">
        {excerpt ? (
          excerpt
        ) : (
          <em className="text-pinkPastel select-none">No preview available</em>
        )}
      </section>

      {/* Footer: Tags + Controls */}
      <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 overflow-x-auto max-w-full">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-mintPastel text-charcoalFog rounded-full px-3 py-1 select-none whitespace-nowrap"
              aria-label={`Tag: ${tag}`}
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex gap-3 text-sm text-pinkPastel">
          <time dateTime={updatedAt || ""} className="whitespace-nowrap">
            Updated {updatedDistance}
          </time>

          <button
            onClick={() => onEdit && onEdit(id)}
            aria-label={`Edit note ${title || "Untitled"}`}
            className="hover:text-indigoPulse focus:outline-none focus:ring-2 focus:ring-indigoPulse rounded"
          >
            Edit
          </button>

          <button
            onClick={() => onShare && onShare(id)}
            aria-label={`Share note ${title || "Untitled"}`}
            className="hover:text-indigoPulse focus:outline-none focus:ring-2 focus:ring-indigoPulse rounded"
          >
            Share
          </button>

          <button
            onClick={() => onDelete && onDelete(id)}
            aria-label={`Delete note ${title || "Untitled"}`}
            className="hover:text-neonCoral focus:outline-none focus:ring-2 focus:ring-neonCoral rounded"
          >
            Delete
          </button>
        </div>
      </footer>
    </article>
  );
};

export default NoteCard;