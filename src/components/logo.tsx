import * as React from "react";

export type LogoProps = {
  className?: string;
  title?: string;
  ariaHidden?: boolean;
  strokeWidth?: number;
};

export default function Logo({
  className,
  title,
  ariaHidden = true,
  strokeWidth = 1.5,
}: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-label={title ? title : undefined}
      aria-hidden={title ? undefined : ariaHidden}
    >
      {title ? <title>{title}</title> : null}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <line
        x1="12"
        y1="21"
        x2="12"
        y2="12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
