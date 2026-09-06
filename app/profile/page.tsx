"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Account } from "@/lib/types";

export default function ProfilePage() {
  const [a, setA] = useState<Account | null>(null);
  const [msg, setMsg] = useState("");

  const [bindCode, setBindCode] = useState("");
  const [bindMsg, setBindMsg] = useState("");
  const [bindLoading, setBindLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(setA);
  }, []);

  if (!a) {
    return (
      <main className="min-h-screen bg-ink text-goldSoft p-8">
        讀取會員資料中…
      </main>
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    const r = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(a),
    });

    const d = await r.json();
    setMsg(r.ok ? "會員資料已更新" : d.error ?? "更新失敗");
  }

  async function createBindCode() {
    setBindLoading(true);
    setBindCode("");
    setBindMsg("");

    try {
      const r = await fetch("/api/line/bind-code", {
        method: "POST",
      });

      const d = await r.json();

      if (!r.ok) {
        setBindMsg(d.error ?? "無法產生 LINE 綁定碼");
        return;
      }

      setBindCode(d.code);
      setBindMsg("請在 10 分鐘內將此綁定碼傳給員林財德宮 LINE 官方帳號。");
    } catch {
      setBindMsg("系統連線失敗，請稍後再試");
    } finally {
      setBindLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink px-4 py-8">
      <div className="max-w-xl mx-auto space-y-6">
        <form
          onSubmit={save}
          className="bg-parchment rounded-2xl border border-gold/50 p-6 sm:p-8"
        >
          <div className="flex justify-between items-center">
            <h1 className="font-serifTC text-2xl text-lacquer font-bold">
              會員基本資料
            </h1>

            <Link href="/" className="text-sm text-lacquer underline">
              返回廟門
            </Link>
          </div>

          <p className="text-sm text-ink/60 mt-1 mb-5">
            更新本人資料時，「本人」祈福對象也會同步更新。
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="text-sm">
              姓名
              <input
                required
                value={a.real_name ?? ""}
                onChange={(e) =>
                  setA({
                    ...a,
                    real_name: e.target.value,
                  })
                }
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </label>

            <label className="text-sm">
              LINE 名稱
              <input
                value={a.line_display_name ?? ""}
                onChange={(e) =>
                  setA({
                    ...a,
                    line_display_name: e.target.value,
                  })
                }
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </label>

            <label className="text-sm sm:col-span-2">
              暱稱
              <input
                value={a.display_name ?? ""}
                onChange={(e) =>
                  setA({
                    ...a,
                    display_name: e.target.value,
                  })
                }
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </label>
          </div>

          <p className="text-sm mt-4 mb-1">農曆生日</p>

          <div className="grid grid-cols-3 gap-2">
            <input
              required
              type="number"
              value={a.lunar_birth_year ?? ""}
              onChange={(e) =>
                setA({
                  ...a,
                  lunar_birth_year: Number(e.target.value),
                })
              }
              placeholder="年"
              className="rounded border px-3 py-2"
            />

            <input
              required
              type="number"
              min="1"
              max="12"
              value={a.lunar_birth_month ?? ""}
              onChange={(e) =>
                setA({
                  ...a,
                  lunar_birth_month: Number(e.target.value),
                })
              }
              placeholder="月"
              className="rounded border px-3 py-2"
            />

            <input
              required
              type="number"
              min="1"
              max="30"
              value={a.lunar_birth_day ?? ""}
              onChange={(e) =>
                setA({
                  ...a,
                  lunar_birth_day: Number(e.target.value),
                })
              }
              placeholder="日"
              className="rounded border px-3 py-2"
            />
          </div>

          <label className="inline-flex gap-2 items-center mt-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(a.lunar_birth_leap_month)}
              onChange={(e) =>
                setA({
                  ...a,
                  lunar_birth_leap_month: e.target.checked,
                })
              }
            />
            此月份為閏月
          </label>

          <label className="block text-sm mt-4">
            祈福地址
            <textarea
              required
              rows={3}
              value={a.address ?? ""}
              onChange={(e) =>
                setA({
                  ...a,
                  address: e.target.value,
                })
              }
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>

          {msg && (
            <p className="mt-4 text-sm text-lacquer">
              {msg}
            </p>
          )}

          <button className="mt-5 w-full bg-lacquer text-goldSoft font-bold rounded py-2.5">
            儲存會員資料
          </button>
        </form>

        <section className="bg-parchment rounded-2xl border border-gold/50 p-6 sm:p-8">
          <h2 className="font-serifTC text-xl text-lacquer font-bold">
            LINE 官方帳號綁定
          </h2>

          <p className="text-sm text-ink/60 mt-2">
            綁定後，未來宮方完成祈福時，可透過 LINE 官方帳號通知您。
          </p>

          {!a.line_user_id && !bindCode && (            <button
              type="button"
              disabled={bindLoading}
              onClick={createBindCode}
              className="mt-5 w-full bg-green-700 text-white font-bold rounded py-2.5 disabled:opacity-50"
            >
              {bindLoading ? "產生中…" : "產生 LINE 綁定碼"}
            </button>
          )}
{a.line_user_id && (
  <div className="mt-5 rounded-xl border border-green-600 bg-green-50 p-5 text-center">
    <p className="text-lg font-bold text-green-700">
      ✓ LINE 官方帳號已綁定
    </p>
    <p className="mt-2 text-sm text-ink/60">
      宮方完成祈福後，將透過 LINE 官方帳號通知您。
    </p>
  </div>
)}          {bindCode && (
            <div className="mt-5 border rounded-xl p-5 text-center bg-white">
              <p className="text-sm text-ink/60">
                您的 LINE 綁定碼
              </p>

              <p className="text-4xl tracking-[0.25em] font-bold text-lacquer mt-3">
                {bindCode}
              </p>

              <p className="mt-3 text-sm">
                10 分鐘內有效
              </p>

              <p className="mt-4 text-sm text-ink/70">
                請開啟「員林財德宮」LINE 官方帳號，
                直接傳送上方 6 位數字。
              </p>

              <button
                type="button"
                onClick={createBindCode}
                disabled={bindLoading}
                className="mt-4 text-sm text-lacquer underline"
              >
                重新產生綁定碼
              </button>
            </div>
          )}

          {bindMsg && (
            <p className="mt-4 text-sm text-lacquer">
              {bindMsg}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
