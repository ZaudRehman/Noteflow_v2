import React, { useState, useEffect, useRef } from "react";

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onShare: (emails: string[], role: "viewer" | "editor", expiryDays?: number) => void;
  shareLink: string; // Generated shareable URL for the note
};

const ROLES = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
];

const EXPIRY_OPTIONS = [
  { value: undefined, label: "Never expire" },
  { value: 1, label: "1 day" },
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
];

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  onShare,
  shareLink,
}) => {
  const [emailsInput, setEmailsInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [expiry, setExpiry] = useState<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEmailsInput("");
      setEmails([]);
      setRole("viewer");
      setExpiry(undefined);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const parseEmails = (input: string) =>
    input
      .split(/[\s,]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

  const addEmails = () => {
    const newEmails = parseEmails(emailsInput);
    if (newEmails.length > 0) {
      setEmails((prev) => Array.from(new Set([...prev, ...newEmails])));
      setEmailsInput("");
    }
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleShare = () => {
    if (emails.length === 0) {
      alert("Please add at least one email");
      return;
    }
    onShare(emails, role, expiry);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="share-modal-title"
    >
      <div className="bg-parchmentLight rounded-3xl shadow-neu w-full max-w-md p-6 m-4 text-textLight">
        <header className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-indigoPulse" id="share-modal-title">
            Share Note
          </h2>
          <button
            onClick={onClose}
            aria-label="Close share modal"
            className="text-pinkPastel hover:text-indigoPulse transition focus:outline-none focus:ring-2 focus:ring-indigoPulse rounded"
          >
            ✕
          </button>
        </header>

        <label htmlFor="email-input" className="block mb-2 text-sm font-medium text-pinkPastel">
          Invite by email
        </label>
        <input
          id="email-input"
          ref={inputRef}
          type="text"
          value={emailsInput}
          onChange={(e) => setEmailsInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addEmails();
            }
          }}
          placeholder="Enter emails separated by commas"
          className="w-full rounded-2xl border border-charcoalFog bg-charcoalFog px-4 py-2 text-snowDrift focus:outline-none focus:ring-2 focus:ring-indigoPulse mb-3"
        />

        <div className="flex flex-wrap gap-2 mb-4">
          {emails.length === 0 && (
            <span className="text-xs text-pinkPastel select-none">No emails added</span>
          )}
          {emails.map((email) => (
            <div
              key={email}
              className="flex items-center bg-indigoPulse rounded-full px-3 py-1 text-xs text-snowDrift select-none"
            >
              {email}
              <button
                onClick={() => removeEmail(email)}
                aria-label={`Remove email ${email}`}
                className="ml-2 hover:text-neonCoral focus:outline-none focus:ring-2 focus:ring-neonCoral rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <label htmlFor="role-select" className="block mb-2 text-sm font-medium text-pinkPastel">
          Role
        </label>
        <select
          id="role-select"
          value={role}
          onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
          className="w-full rounded-2xl border border-charcoalFog bg-charcoalFog px-4 py-2 mb-4 text-snowDrift focus:outline-none focus:ring-2 focus:ring-indigoPulse"
        >
          {ROLES.map(({ value, label }) => (
            <option key={value} value={value} className="bg-charcoalFog text-snowDrift">
              {label}
            </option>
          ))}
        </select>

        <label htmlFor="expiry-select" className="block mb-2 text-sm font-medium text-pinkPastel">
          Expiry
        </label>
        <select
          id="expiry-select"
          value={expiry === undefined ? "" : expiry}
          onChange={(e) =>
            setExpiry(e.target.value === "" ? undefined : Number(e.target.value))
          }
          className="w-full rounded-2xl border border-charcoalFog bg-charcoalFog px-4 py-2 mb-6 text-snowDrift focus:outline-none focus:ring-2 focus:ring-indigoPulse"
        >
          {EXPIRY_OPTIONS.map(({ value, label }) => (
            <option key={label} value={value ?? ""} className="bg-charcoalFog text-snowDrift">
              {label}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="rounded-3xl bg-charcoalFog px-6 py-2 text-pinkPastel hover:bg-indigoPulse hover:text-snowDrift transition focus:outline-none focus:ring-2 focus:ring-indigoPulse"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            className="rounded-3xl bg-indigoPulse px-6 py-2 text-snowDrift hover:bg-indigo600 transition focus:outline-none focus:ring-2 focus:ring-indigoPulse"
          >
            Send Invites
          </button>
        </div>

        {shareLink && (
          <section className="mt-6">
            <h3 className="text-sm text-pinkPastel font-medium mb-2">Share link</h3>
            <input
              type="text"
              readOnly
              value={shareLink}
              onFocus={(e) => (e.currentTarget as HTMLInputElement).select()}
              className="w-full rounded-3xl border border-charcoalFog bg-charcoalFog px-4 py-2 text-snowDrift cursor-pointer select-all"
              aria-label="Shareable link"
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default ShareModal;