"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assignedAccountNo, setAssignedAccountNo] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, display_name: displayName }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "註冊失敗");
      return;
    }
    setAssignedAccountNo(data.account_no);
  }

  if (assignedAccountNo) {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="max-w-sm text-center bg-parchment rounded-2xl border border-gold/50 shadow-plaque p-8">
          <h1 className="font-serifTC text-xl text-lacquer font-bold mb-3">註冊成功</h1>
          <p className="text-ink/70 text-sm mb-2">你的登入帳號是：</p>
          <p className="font-serifTC text-4xl font-bold text-lacquer tracking-widest mb-4">
            {assignedAccountNo}
          </p>
          <p className="text-ink/60 text-xs mb-6">
            請務必記下這組 4 碼帳號，之後登入需要用到，忘記的話要請管理員協助查詢。
          </p>
          <Link
            href="/"
            className="inline-block w-full rounded bg-lacquer text-goldSoft font-semibold py-2.5 hover:bg-lacquerDark transition-colors"
          >
            進入廟門
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-parchment rounded-2xl border border-gold/50 shadow-plaque p-8"
      >
        <h1 className="font-serifTC text-2xl text-lacquer font-bold text-center mb-1">
          加入網路財神廟
        </h1>
        <p className="text-center text-ink/60 text-sm mb-6">
          註冊後系統會自動配發一組 4 碼帳號
        </p>

        <label className="block text-sm text-ink mb-1">暱稱</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="信眾稱呼，選填"
          className="w-full mb-4 rounded border border-gold/50 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ember"
        />

        <label className="block text-sm text-ink mb-1">設定密碼</label>
        <input
          type="password"
          required
          minLength={4}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 rounded border border-gold/50 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ember"
        />

        <label className="block text-sm text-ink mb-1">確認密碼</label>
        <input
          type="password"
          required
          minLength={4}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-4 rounded border border-gold/50 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ember"
        />

        {error && <p className="text-lacquer text-sm mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-lacquer text-goldSoft font-semibold py-2.5 hover:bg-lacquerDark transition-colors disabled:opacity-60"
        >
          {loading ? "註冊中…" : "註冊"}
        </button>

        <p className="text-center text-sm text-ink/60 mt-5">
          已經有帳號？{" "}
          <Link href="/login" className="text-ember font-medium">
            登入
          </Link>
        </p>
      </form>
    </main>
  );
}
