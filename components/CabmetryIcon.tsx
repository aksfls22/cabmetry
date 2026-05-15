interface CabmetryIconProps {
  className?: string;
}

/** Minimal Cabmetry mark: rounded square + stylized “C”. */
export function CabmetryIcon({ className }: CabmetryIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="#0f1419" />
      <rect
        width="32"
        height="32"
        rx="9"
        stroke="#2d3a4f"
        strokeWidth="0.5"
        fill="none"
      />
      <path
        d="M22.25 10.5C20.2 8.2 16.85 7 13.25 7C8.41 7 4.5 10.91 4.5 15.75C4.5 20.59 8.41 24.5 13.25 24.5C16.85 24.5 20.2 23.3 22.25 21"
        stroke="#fbbf24"
        strokeWidth="2.85"
        strokeLinecap="round"
      />
    </svg>
  );
}
