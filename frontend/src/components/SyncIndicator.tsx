import React from "react";

type SyncIndicatorProps = {
  isSyncing: boolean;
  collaboratorsOnline: number;
  lastSyncedAt?: string; // ISO timestamp
  userNames?: string[]; // Names of collaborators currently editing
  className?: string;
};

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  isSyncing,
  collaboratorsOnline,
  lastSyncedAt,
  userNames = [],
  className = "",
}) => {
  const lastSyncedDisplay = lastSyncedAt
    ? `Last synced ${new Date(lastSyncedAt).toLocaleTimeString()}`
    : "Not synced yet";

  return (
    <div
      className={`bg-parchmentLight rounded-3xl shadow-neu p-3 flex items-center justify-between text-indigoPulse text-sm select-none ${className}`}
      role="status"
      aria-live="polite"
    >
      <span>
        {isSyncing ? (
          <span className="animate-pulse">Syncing…</span>
        ) : (
          `${collaboratorsOnline} collaborator${collaboratorsOnline !== 1 ? "s" : ""} online`
        )}
      </span>
      {userNames.length > 0 && (
        <span className="text-pinkPastel ml-4 truncate max-w-xs">
          {userNames.join(", ")} {userNames.length === 1 ? "is" : "are"} editing
        </span>
      )}
      <span className="ml-auto text-xs text-pinkPastel whitespace-nowrap">
        {lastSyncedDisplay}
      </span>
    </div>
  );
};

export default SyncIndicator;