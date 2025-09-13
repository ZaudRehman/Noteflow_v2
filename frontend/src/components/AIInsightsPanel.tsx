import React, { useState, useEffect, useCallback } from "react";

type AIInsightsPanelProps = {
  summary: string;
  suggestedTags: string[];
  onAddTag: (tag: string) => void;
  onRefine: (currentSummary: string) => Promise<void> | void;
  onSendToChatGPT: (currentSummary: string) => Promise<void> | void;
  onSummaryChange?: (newSummary: string) => void;
  saving?: boolean;
  className?: string;
};

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  summary,
  suggestedTags,
  onAddTag,
  onRefine,
  onSendToChatGPT,
  onSummaryChange,
  saving = false,
  className = "",
}) => {
  const [localSummary, setLocalSummary] = useState(summary);

  useEffect(() => {
    setLocalSummary(summary);
  }, [summary]);

  // Debounce local changes before notifying parent
  useEffect(() => {
    if (!onSummaryChange) return;
    const handler = setTimeout(() => {
      onSummaryChange(localSummary);
    }, 500);
    return () => clearTimeout(handler);
  }, [localSummary, onSummaryChange]);

  const handleAddTag = useCallback(
    (tag: string) => {
      if (!suggestedTags.includes(tag)) {
        return; // avoid adding unknown tag
      }
      onAddTag(tag);
    },
    [onAddTag, suggestedTags]
  );

  return (
    <aside
      className={`bg-parchmentLight rounded-3xl shadow-neu p-6 flex flex-col gap-6 ${className}`}
      aria-label="AI Insights Panel"
    >
      <header className="flex justify-between items-center">
        <h2 className="text-indigoPulse font-semibold text-xl tracking-wide">AI Summary</h2>
        <span className="text-pink pastel text-sm select-none">
          {saving ? "Saving…" : "Up to date"}
        </span>
      </header>

      <textarea
        value={localSummary}
        onChange={(e) => setLocalSummary(e.target.value)}
        className="min-h-[120px] w-full rounded-2xl bg-whiteSmoke p-4 text-charcoal focus:outline-none focus:ring-2 focus:ring-indigoPulse shadow-inner shadow-white"
        placeholder="No summary available yet."
        aria-label="AI-generated summary"
      />

      {suggestedTags.length > 0 && (
        <section>
          <h3 className="text-pink pastel text-sm font-semibold mb-2">Suggested Tags</h3>
          <div className="flex flex-wrap gap-3">
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="cursor-pointer rounded-full bg-mintPastel px-4 py-1 text-xs text-charcoal hover:bg-mintPastel/80 transition shadow-neu"
                aria-label={`Add tag ${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>
      )}

      <footer className="flex justify-end gap-4">
        <button
          onClick={() => onRefine(localSummary)}
          className="rounded-3xl bg-whiteSmoke px-6 py-2 text-indigoPulse font-semibold shadow-neu hover:shadow-inner hover:bg-indigoPulse hover:text-white transition"
          aria-label="Refine AI summary"
        >
          Refine
        </button>
        <button
          onClick={() => onSendToChatGPT(localSummary)}
          className="rounded-3xl bg-indigoPulse px-6 py-2 text-white font-semibold shadow-neu hover:shadow-inner hover:bg-indigo600 transition"
          aria-label="Send summary to ChatGPT"
        >
          Send to ChatGPT
        </button>
      </footer>
    </aside>
  );
};

export default AIInsightsPanel;