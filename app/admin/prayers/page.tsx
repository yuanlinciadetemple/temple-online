"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WorshipOrder } from "@/lib/types";

export default function PrayerAdminPage(){
  const [orders,setOrders]=useState<WorshipOrder[]>([]),[mode,setMode]=useState<"today"|"pending"|"completed"|"all">("today"),[q,setQ]=useState(""),[selected,setSelected]=useState<number[]>([]),[toast,setToast]=useState("");
  const load=useCallback(async()=>{const p=new URLSearchParams();if(mode==="today"){p.set("today","1");p.set("status","pending")}else if(mode!=="all")p.set("status",mode);if(q.trim())p.set("q",q.trim());const r=await fetch(`/api/admin/prayers?${p}`);const d=await r.json();if(r.ok)setOrders(d);},[mode,q]);
  useEffect(()=>{load()},[load]);
  const allChecked=useMemo(()=>orders.length>0&&orders.every(o=>selected.includes(o.id)),[orders,selected]);
  async function complete(id:number){if(!confirm("確認已完成這筆祈福？"))return;const r=await fetch(`/api/admin/prayers/${id}/complete`,{method:"POST"});const d=await r.json();if(!r.ok)return setToast(d.error??"操作失敗");setToast("已完成祈福");setSelected(s=>s.filter(x=>x!==id));load();}
  function print(ids:number[]){if(!ids.length)return setToast("請先勾選要列印的紀錄");window.open(`/admin/print?ids=${ids.join(",")}`,"_blank");}
  return <main className="min-h-screen bg-ink p-4 sm:p-8"><div className="max-w-6xl mx-auto"><div className="flex flex-wrap justify-between gap-3 items-center mb-5"><h1 className="font-serifTC text-2xl text-goldSoft font-bold">宮方祈福作業</h1><div className="flex gap-2"><Link href="/admin" className="border border-gold/50 text-goldSoft rounded px-3 py-2 text-sm">會員／供品管理</Link><Link href="/" className="border border-gold/50 text-goldSoft rounded px-3 py-2 text-sm">回到廟門</Link></div></div>
  <div className="bg-parchment rounded-xl border border-gold/40 p-4 mb-4"><div className="flex flex-wrap gap-2 mb-3">{([['today','今日待祈福'],['pending','全部待祈福'],['completed','已完成'],['all','全部紀錄']] as const).map(([v,l])=><button key={v} onClick={()=>{setMode(v);setSelected([])}} className={`rounded px-3 py-2 text-sm ${mode===v?'bg-lacquer text-goldSoft':'border border-gold/50 text-ink'}`}>{l}</button>)}</div><div className="flex flex-wrap gap-2"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="搜尋敬獻編號、帳號、姓名" className="flex-1 min-w-[220px] rounded border border-gold/50 px-3 py-2"/><button onClick={load} className="bg-lacquer text-goldSoft rounded px-4">搜尋</button><button onClick={()=>print(selected)} className="bg-gold text-ink rounded px-4 font-semibold">列印已勾選</button>{mode==='today'&&<button onClick={()=>print(orders.map(o=>o.id))} className="border border-lacquer text-lacquer rounded px-4">列印今日全部</button>}</div></div>
  {toast&&<p className="mb-3 rounded bg-goldSoft text-ink px-3 py-2 text-sm">{toast}</p>}
  <div className="overflow-x-auto rounded-xl border border-gold/40"><table className="w-full min-w-[950px] text-sm"><thead className="bg-lacquerDark text-goldSoft"><tr><th className="p-3"><input type="checkbox" checked={allChecked} onChange={e=>setSelected(e.target.checked?orders.map(o=>o.id):[])}/></th><th className="text-left p-3">時間／編號</th><th className="text-left p-3">會員</th><th className="text-left p-3">祈福對象</th><th className="text-left p-3">供品</th><th className="text-left p-3">CDTB</th><th className="text-left p-3">狀態</th><th className="p-3">操作</th></tr></thead><tbody>{orders.map(o=><tr key={o.id} className="bg-parchment border-t border-gold/20 align-top"><td className="p-3"><input type="checkbox" checked={selected.includes(o.id)} onChange={e=>setSelected(s=>e.target.checked?[...s,o.id]:s.filter(x=>x!==o.id))}/></td><td className="p-3"><p>{new Date(o.created_at).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'})}</p><p className="text-xs text-ink/50">{o.order_no}</p></td><td className="p-3">
  <Link
    className="text-lacquer underline"
    href={`/admin/members/${o.account_no}`}
  >
    {o.member?.real_name || o.member?.display_name || o.account_no}
  </Link>

  <p className="text-xs text-ink/50">
    帳號 {o.account_no}
    {o.member?.line_display_name
      ? `｜LINE ${o.member.line_display_name}`
      : ""}
  </p>

  <p
    className={`text-xs mt-1 font-medium ${
      o.line_bound ? "text-green-700" : "text-red-600"
    }`}
  >
    {o.line_bound ? "✓ 已綁定 LINE" : "未綁定 LINE"}
  </p>
</td><td className="p-3"><p className="font-medium">{o.prayer_name}</p><p className="text-xs text-ink/50">農曆 {o.prayer_lunar_birth_year}年{o.prayer_lunar_birth_leap_month?'閏':''}{o.prayer_lunar_birth_month}月{o.prayer_lunar_birth_day}日</p><p className="text-xs max-w-[240px]">{o.prayer_address}</p></td><td className="p-3">{o.items?.map(i=>i.offering_name).join('、')}</td><td className="p-3">{o.total_points.toLocaleString()}</td><td className="p-3"><span className={o.status==='completed'?'text-green-700':'text-amber-700'}>{o.status==='completed'?'已完成':'待祈福'}</span>{o.completed_at&&<p className="text-xs text-ink/50">{new Date(o.completed_at).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'})}</p>}</td><td className="p-3"><div className="flex gap-1"><button onClick={()=>print([o.id])} className="border border-lacquer text-lacquer rounded px-2 py-1">列印</button>{o.status==='pending'&&<button onClick={()=>complete(o.id)} className="bg-lacquer text-goldSoft rounded px-2 py-1">完成祈福</button>}</div></td></tr>)}{orders.length===0&&<tr><td colSpan={8} className="bg-parchment text-center text-ink/50 p-8">目前沒有符合的敬獻紀錄</td></tr>}</tbody></table></div></div></main>
}
