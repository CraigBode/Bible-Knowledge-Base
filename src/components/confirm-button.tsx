"use client";

import type { ReactNode } from "react";

export function ConfirmButton({
  children,
  message = "Are you sure? This cannot be undone.",
  className = "btn btn-danger",
}: {
  children: ReactNode;
  message?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
