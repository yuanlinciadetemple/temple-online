"use client";

import { useState } from "react";
import { Offering } from "@/lib/types";
import { OFFERING_ICONS } from "@/components/icons/OfferingIcons";

type Status = "idle" | "loading" | "done" | "error";

export default function OfferingSlot({
  offering,
  currentPoints,
  onWorshipped,
}: {
  offering: Offering;
  currentPoints: number;
  onWorshipped: (offeringId: number, newPoints: number) => Promise<void> | void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const Icon = OFFERING_ICONS[offering.icon_key];
  const affordable = currentPoints >= offering.cost;

  async function handleClick() {
    if (status === "loading" || !affordable) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/worship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offering_id: offering.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "敬獻失敗");
      const newPoints = data.new_points ?? currentPoints - offering.cost;
      await onWorshipped(offering.id, newPoints);
      setStatus("done");
      setMessage(`已敬獻${offering.name}，神明保佑`);
      setTimeout(() => setStatus("idle"), 1800);
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message ?? "敬獻失敗，請稍後再試");
      setTimeout(() => setStatus("idle"), 2200);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!affordable || status === "loading"}
      className={[
        "relative flex flex-col items-center gap-2 rounded-xl border px-3 py-4 sm:px-4 sm:py-5 transition-all duration-200",
        "bg-parchment/95 border-gold/60 shadow-md",
        affordable
          ? "hover:-translate-y-1 hover:shadow-lg active:translate-y-0 cursor-pointer"
          : "opacity-50 cursor-not-allowed",
        status === "done" ? "ring-2 ring-ember" : "",
      ].join(" ")}
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14">
        <Icon />
      </div>
      <span className="font-serifTC text-ink text-sm sm:text-base font-semibold">
        {offering.name}
      </span>
      <span className="text-xs text-lacquer font-sansTC">
        {offering.cost.toLocaleString()} CDTB
      </span>

      {status === "loading" && (
        <span className="absolute -top-2 -right-2 text-[10px] bg-gold text-ink rounded-full px-2 py-0.5 shadow">
          敬獻中…
        </span>
      )}
      {message && status !== "loading" && (
        <span
          className={[
            "absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-2 py-1 rounded shadow",
            status === "error" ? "bg-lacquer text-goldSoft" : "bg-ember text-parchment",
          ].join(" ")}
        >
          {message}
        </span>
      )}
    </button>
  );
}
