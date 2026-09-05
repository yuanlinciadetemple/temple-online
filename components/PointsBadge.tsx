"use client";

export default function PointsBadge({
  points,
  displayName,
}: {
  points: number;
  displayName: string;
}) {
  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col items-end gap-1 z-20">
      <div className="rounded-lg bg-lacquer/90 border border-gold/70 shadow-plaque px-4 py-2 backdrop-blur-sm">
        <p className="text-[11px] tracking-wide text-goldSoft/90 font-sansTC text-right">
          {displayName} 的功德點數
        </p>
        <p className="text-2xl font-serifTC font-bold text-gold text-right leading-tight">
          {points.toLocaleString()} CDTB
        </p>
      </div>
    </div>
  );
}
