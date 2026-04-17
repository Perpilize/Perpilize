export function CircuitPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path
            d="M10 10h20v20h-20zM40 10h20v20h-20zM70 10h20v20h-20z
               M10 40h20v20h-20zM40 40h20v20h-20zM70 40h20v20h-20z
               M10 70h20v20h-20zM40 70h20v20h-20zM70 70h20v20h-20z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.1"
          />
          <circle cx="30" cy="30" r="2" fill="currentColor" opacity="0.2" />
          <circle cx="60" cy="60" r="2" fill="currentColor" opacity="0.2" />
          <line x1="30" y1="30" x2="60" y2="60" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
  );
}
