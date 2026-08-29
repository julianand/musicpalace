import { useId } from "react";

const SIZES = {
  sm: { svg: "w-3.5 h-3.5", gap: "gap-0.5" },
  md: { svg: "w-5 h-5", gap: "gap-1" },
} as const;

export function StarRating({
  rating,
  size = "md",
}: {
  rating: number;
  size?: keyof typeof SIZES;
}) {
  const gradientId = useId().replace(/:/g, "");
  const full = Math.floor(rating);
  const partial = rating % 1;
  const empty = 5 - Math.ceil(rating);
  const { svg, gap } = SIZES[size];

  return (
    <div className={`flex items-center ${gap}`}>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f-${i}`} className={svg} viewBox="0 0 24 24" fill="#f0a500">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {partial > 0 && (
        <svg className={svg} viewBox="0 0 24 24">
          <defs>
            <linearGradient id={gradientId}>
              <stop offset={`${partial * 100}%`} stopColor="#f0a500" />
              <stop offset={`${partial * 100}%`} stopColor="#2a2a32" />
            </linearGradient>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={`url(#${gradientId})`}
          />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e-${i}`} className={svg} viewBox="0 0 24 24" fill="#2a2a32">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}