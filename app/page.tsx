"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Account, Offering } from "@/lib/types";
import PointsBadge from "@/components/PointsBadge";
import OfferingSlot from "@/components/OfferingSlot";

export default function AltarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = useCallback(async () => {
    const meRes = await fetch("/api/me");
    if (meRes.status === 401) {
      router.replace("/login");
      return;
    }
    const meData = await meRes.json();
    if (!meRes.ok) {
      setErrorMsg(meData.error ?? "找不到會員資料");
      setLoading(false);
      return;
    }
    setAccount(meData as Account);

    const offeringsRes = await fetch("/api/offerings");
    const offeringsData = await offeringsRes.json();
    if (offeringsRes.ok) {
      setOfferings(offeringsData as Offering[]);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleWorshipped(_offeringId: number, newPoints: number) {
    setAccount((prev) => (prev ? { ...prev, points: newPoints } : prev));
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ink">
        <p className="text-goldSoft font-serifTC">敬請稍候，正在開啟廟門…</p>
      </main>
    );
  }

  if (!account) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ink px-6">
        <p className="text-goldSoft font-sansTC text-center">
          {errorMsg || "找不到會員資料，請重新登入。"}
        </p>
      </main>
    );
  }

  const displayName = account.display_name || `帳號 ${account.account_no}`;

  return (
    <main className="min-h-screen bg-ink">
      {/* Hero：財神廟照片 */}
      <section className="relative h-[62vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src="/temple-bg.jpg"
          alt="財神廟神龕"
          fill
          priority
          className="object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/10 to-ink" />

        <PointsBadge points={account.points} displayName={displayName} />

        <button
          onClick={handleLogout}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 text-xs sm:text-sm text-goldSoft/90 border border-gold/50 rounded px-3 py-1.5 bg-ink/40 hover:bg-ink/60 transition-colors z-20"
        >
          登出（帳號 {account.account_no}）
        </button>

        {account.is_admin && (
          <button
            onClick={() => router.push("/admin")}
            className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-xs sm:text-sm text-ink font-semibold bg-gold rounded px-3 py-1.5 hover:bg-goldSoft transition-colors z-20"
          >
            後台管理
          </button>
        )}

        <div className="absolute bottom-6 w-full text-center px-4">
          <h1 className="font-serifTC text-goldSoft text-2xl sm:text-4xl font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            網路財神廟
          </h1>
          <p className="text-goldSoft/80 text-xs sm:text-sm mt-1">
            誠心一炷香，敬獻結善緣
          </p>
        </div>
      </section>

      {/* 供品桌 */}
      <section className="relative -mt-8 sm:-mt-10 px-4 pb-14 z-10">
        <div className="max-w-4xl mx-auto rounded-2xl bg-lacquerDark/95 border border-gold/40 shadow-plaque p-5 sm:p-8">
          <p className="text-center text-goldSoft/90 font-serifTC text-sm sm:text-base mb-5">
            選擇供品，誠心敬獻
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-5 place-items-stretch">
            {offerings.map((offering) => (
              <OfferingSlot
                key={offering.id}
                offering={offering}
                currentPoints={account.points}
                onWorshipped={handleWorshipped}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
