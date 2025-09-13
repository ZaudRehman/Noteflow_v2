import React, { useEffect } from "react";

type FeedbackToastProps = {
  message: string;
  type: "success" | "error";
  duration?: number; // milliseconds, defaults to 4000ms
  onClose: () => void;
};

export const FeedbackToast: React.FC<FeedbackToastProps> = ({
  message,
  type,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onClose();
    }, duration);
    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  const bgColor = type === "success" ? "bg-emeraldGlow" : "bg-neonCoral";

  const icon = type === "success" ? (
    <svg
      className="w-5 h-5 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg
      className="w-5 h-5 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <section
      role="alert"
      className={`fixed bottom-6 right-6 flex items-center max-w-xs rounded-3xl px-4 py-3 shadow-neu ${bgColor} text-white select-none`}
    >
      <div className="mr-3">{icon}</div>
      <p className="flex-1 text-sm">{message}</p>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="ml-4 rounded focus:outline-none focus:ring-2 focus:ring-white hover:opacity-75 transition"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </section>
  );
};

export default FeedbackToast;
