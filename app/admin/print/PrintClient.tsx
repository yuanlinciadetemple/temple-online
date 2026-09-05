"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WorshipOrder } from "@/lib/types";

export default function PrintClient() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || "";
  const ids = useMemo(() => idsParam.split(",").filter(Boolean), [idsParam]);
  const [orders, setOrders] = useState<WorshipOrder[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setOrders([]);
      return;
    }

    Promise.all(
      ids.map((id) => fetch(`/api/admin/prayers/${id}`).then((r) => r.json()))
    ).then(setOrders);
  }, [ids]);

  return (
    <main className="print-root bg-neutral-100 min-h-screen py-6">
      <div className="no-print max-w-[210mm] mx-auto mb-4 flex gap-2 px-4">
        <button
          onClick={() => window.print()}
          className="bg-black text-white rounded px-4 py-2"
        >
          列印／另存 PDF
        </button>
        <button
          onClick={() => window.close()}
          className="border border-black rounded px-4 py-2"
        >
          關閉
        </button>
      </div>

      {orders.map((o) => (
        <article
          key={o.id}
          className="a4-page bg-white mx-auto p-[18mm] text-black"
        >
          <header className="text-center border-b-2 border-black pb-4">
            <h1 className="text-3xl font-bold tracking-[.2em]">員林財德宮</h1>
            <h2 className="text-xl font-bold mt-2">敬獻祈福資料單</h2>
          </header>

          <p className="mt-5 text-sm">
            敬獻編號：<strong>{o.order_no}</strong>
          </p>

          <section className="mt-6">
            <h3 className="font-bold text-lg border-b border-black pb-1">祈福資料</h3>
            <div className="mt-3 space-y-2 text-base">
              <p>姓名：{o.prayer_name}</p>
              <p>
                農曆生日：{o.prayer_lunar_birth_year}年
                {o.prayer_lunar_birth_leap_month ? "閏" : ""}
                {o.prayer_lunar_birth_month}月{o.prayer_lunar_birth_day}日
              </p>
              <p>地址：{o.prayer_address}</p>
              <p>
                會員帳號：{o.account_no}
                {o.member?.line_display_name
                  ? `　LINE 名稱：${o.member.line_display_name}`
                  : ""}
              </p>
            </div>
          </section>

          <section className="mt-7">
            <h3 className="font-bold text-lg border-b border-black pb-1">敬獻資料</h3>
            <div className="mt-3 space-y-2 text-base">
              <p>
                供品：<strong>{o.items?.map((i) => i.offering_name).join("、")}</strong>
              </p>
              <p>
                敬獻時間：
                {new Date(o.created_at).toLocaleString("zh-TW", {
                  timeZone: "Asia/Taipei",
                })}
              </p>
              <p>使用點數：{o.total_points.toLocaleString()} CDTB</p>
            </div>
          </section>

          <section className="mt-9">
            <h3 className="font-bold text-lg border-b border-black pb-1">宮方處理</h3>
            <div className="mt-4 space-y-5 text-base">
              <p>□ 已完成祈福</p>
              <p>完成日期：________________________________</p>
              <p>備註：____________________________________</p>
              <p>　　　____________________________________</p>
            </div>
          </section>

          <footer className="mt-12 text-center text-xs text-neutral-500">
            本資料單僅供員林財德宮祈福作業使用
          </footer>
        </article>
      ))}
    </main>
  );
}
