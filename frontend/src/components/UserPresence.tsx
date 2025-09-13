import React from "react";

type UserPresenceProps = {
  userId: string; // Current user's clientId
  colors: string[]; // Array of pastel colors for collaborators
  collaborators?: Array<{
    id: string;
    name: string;
  }>;
  className?: string;
};

export const UserPresence: React.FC<UserPresenceProps> = ({
  userId,
  colors,
  collaborators = [],
  className = "",
}) => {
  // Filter out current user to only show others
  const otherUsers = collaborators.filter((c) => c.id !== userId);

  return (
    <div
      className={`flex flex-wrap gap-3 ${className}`}
      aria-label="Collaborators currently editing"
    >
      {otherUsers.length === 0 && (
        <span className="text-pinkPastel select-none text-sm">No collaborators online</span>
      )}
      {otherUsers.map((collab, index) => {
        const color = colors[index % colors.length];
        return (
          <div
            key={collab.id}
            className="flex items-center space-x-2 cursor-default select-none"
            title={collab.name}
          >
            <div
              className="h-7 w-7 rounded-full ring-2 bg-whiteSmoke flex items-center justify-center font-semibold text-[10px] text-charcoal"
              style={{ boxShadow: `0 0 8px 2px ${color}` }}
            >
              {collab.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span className="text-indigoPulse text-sm font-medium">{collab.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default UserPresence;
