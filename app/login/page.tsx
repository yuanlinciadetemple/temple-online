"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [accountNo, setAccountNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_no: accountNo, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "登入失敗");
      return;
    }
    router.replace("/");
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-parchment rounded-2xl border border-gold/50 shadow-plaque p-8"
      >
        <h1 className="font-serifTC text-2xl text-lacquer font-bold text-center mb-1">
          網路財神廟
        </h1>
        <p className="text-center text-ink/60 text-sm mb-6">會員登入</p>

        <label className="block text-sm text-ink mb-1">帳號（4 碼）</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          required
          value={accountNo}
          onChange={(e) => setAccountNo(e.target.value.replace(/\D/g, ""))}
          placeholder="0001"
          className="w-full mb-4 rounded border border-gold/50 px-3 py-2 bg-white tracking-widest text-center text-lg focus:outline-none focus:ring-2 focus:ring-ember"
        />

        <label className="block text-sm text-ink mb-1">密碼</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 rounded border border-gold/50 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ember"
        />

        {error && <p className="text-lacquer text-sm mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-lacquer text-goldSoft font-semibold py-2.5 hover:bg-lacquerDark transition-colors disabled:opacity-60"
        >
          {loading ? "登入中…" : "登入"}
        </button>

        <p className="text-center text-sm text-ink/60 mt-5">
          還沒有帳號？{" "}
          <Link href="/signup" className="text-ember font-medium">
            立即註冊
          </Link>
        </p>
      </form>
    </main>
  );
}
