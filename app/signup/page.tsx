"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({ real_name: "", display_name: "", line_display_name: "", lunar_birth_year: "", lunar_birth_month: "", lunar_birth_day: "", lunar_birth_leap_month: false, address: "", password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assignedAccountNo, setAssignedAccountNo] = useState("");
  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (form.password !== form.confirm_password) return setError("兩次輸入的密碼不一致");
    setLoading(true);
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, lunar_birth_year: Number(form.lunar_birth_year), lunar_birth_month: Number(form.lunar_birth_month), lunar_birth_day: Number(form.lunar_birth_day) }) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) return setError(data.error ?? "註冊失敗");
    setAssignedAccountNo(data.account_no);
  }

  if (assignedAccountNo) return <main className="min-h-screen bg-ink flex items-center justify-center px-4"><div className="max-w-sm text-center bg-parchment rounded-2xl border border-gold/50 shadow-plaque p-8"><h1 className="font-serifTC text-xl text-lacquer font-bold mb-3">註冊成功</h1><p className="text-ink/70 text-sm mb-2">你的登入帳號是：</p><p className="font-serifTC text-4xl font-bold text-lacquer tracking-widest mb-4">{assignedAccountNo}</p><p className="text-ink/60 text-xs mb-6">請記下這組 4 碼帳號。系統已同時建立「本人」祈福資料。</p><Link href="/" className="inline-block w-full rounded bg-lacquer text-goldSoft font-semibold py-2.5">進入廟門</Link></div></main>;

  return <main className="min-h-screen bg-ink flex items-center justify-center px-4 py-8"><form onSubmit={handleSubmit} className="w-full max-w-xl bg-parchment rounded-2xl border border-gold/50 shadow-plaque p-6 sm:p-8"><h1 className="font-serifTC text-2xl text-lacquer font-bold text-center">加入網路財神廟</h1><p className="text-center text-ink/60 text-sm mt-1 mb-6">會員基本資料只需建立一次，敬獻時可直接使用</p>
    <div className="grid sm:grid-cols-2 gap-4">
      <label className="text-sm text-ink">姓名<input required value={form.real_name} onChange={e=>set("real_name",e.target.value)} className="mt-1 w-full rounded border border-gold/50 px-3 py-2 bg-white" /></label>
      <label className="text-sm text-ink">LINE 名稱<input value={form.line_display_name} onChange={e=>set("line_display_name",e.target.value)} className="mt-1 w-full rounded border border-gold/50 px-3 py-2 bg-white" placeholder="選填" /></label>
    </div>
    <label className="block text-sm text-ink mt-4">暱稱<input value={form.display_name} onChange={e=>set("display_name",e.target.value)} className="mt-1 w-full rounded border border-gold/50 px-3 py-2 bg-white" placeholder="未填則使用姓名" /></label>
    <div className="mt-4"><p className="text-sm text-ink mb-1">農曆生日</p><div className="grid grid-cols-3 gap-2"><input required type="number" min="1" placeholder="年" value={form.lunar_birth_year} onChange={e=>set("lunar_birth_year",e.target.value)} className="rounded border border-gold/50 px-3 py-2 bg-white"/><input required type="number" min="1" max="12" placeholder="月" value={form.lunar_birth_month} onChange={e=>set("lunar_birth_month",e.target.value)} className="rounded border border-gold/50 px-3 py-2 bg-white"/><input required type="number" min="1" max="30" placeholder="日" value={form.lunar_birth_day} onChange={e=>set("lunar_birth_day",e.target.value)} className="rounded border border-gold/50 px-3 py-2 bg-white"/></div><label className="inline-flex gap-2 items-center mt-2 text-sm"><input type="checkbox" checked={form.lunar_birth_leap_month} onChange={e=>set("lunar_birth_leap_month",e.target.checked)}/>此月份為閏月</label></div>
    <label className="block text-sm text-ink mt-4">祈福地址<textarea required value={form.address} onChange={e=>set("address",e.target.value)} className="mt-1 w-full rounded border border-gold/50 px-3 py-2 bg-white" rows={2}/></label>
    <div className="grid sm:grid-cols-2 gap-4 mt-4"><label className="text-sm text-ink">設定密碼<input required minLength={4} type="password" value={form.password} onChange={e=>set("password",e.target.value)} className="mt-1 w-full rounded border border-gold/50 px-3 py-2 bg-white"/></label><label className="text-sm text-ink">確認密碼<input required minLength={4} type="password" value={form.confirm_password} onChange={e=>set("confirm_password",e.target.value)} className="mt-1 w-full rounded border border-gold/50 px-3 py-2 bg-white"/></label></div>
    {error && <p className="text-lacquer text-sm mt-4">{error}</p>}<button disabled={loading} className="mt-5 w-full rounded bg-lacquer text-goldSoft font-semibold py-2.5 disabled:opacity-60">{loading?"註冊中…":"註冊"}</button><p className="text-center text-sm text-ink/60 mt-5">已經有帳號？ <Link href="/login" className="text-ember font-medium">登入</Link></p>
  </form></main>;
}
