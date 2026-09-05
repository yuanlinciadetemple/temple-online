"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Account, Offering, OFFERING_ICON_OPTIONS } from "@/lib/types";
import { OFFERING_ICONS } from "@/components/icons/OfferingIcons";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myAccountNo, setMyAccountNo] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  // 供品編輯草稿
  const [offeringDrafts, setOfferingDrafts] = useState<Record<number, Partial<Offering>>>({});
  const [busyOfferingId, setBusyOfferingId] = useState<number | null>(null);
  const [newOfferingName, setNewOfferingName] = useState("");
  const [newOfferingIcon, setNewOfferingIcon] = useState<Offering["icon_key"]>("flower");
  const [newOfferingCost, setNewOfferingCost] = useState("");
  const [creatingOffering, setCreatingOffering] = useState(false);

  // 每個帳號列的輸入草稿
  const [pointsDraft, setPointsDraft] = useState<Record<string, string>>({});
  const [passwordDraft, setPasswordDraft] = useState<Record<string, string>>({});
  const [busyAccountNo, setBusyAccountNo] = useState<string | null>(null);

  // 新增帳號表單
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPoints, setNewPoints] = useState("0");
  const [creating, setCreating] = useState(false);

  const loadAccounts = useCallback(async () => {
    const meRes = await fetch("/api/me");
    if (meRes.status === 401) {
      router.replace("/login");
      return;
    }
    const me = await meRes.json();
    if (!me.is_admin) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setIsAdmin(true);
    setMyAccountNo(me.account_no);

    const res = await fetch("/api/admin/accounts");
    const data = await res.json();
    if (res.ok) setAccounts(data as Account[]);

    const offeringsRes = await fetch("/api/admin/offerings");
    const offeringsData = await offeringsRes.json();
    if (offeringsRes.ok) setOfferings(offeringsData as Offering[]);

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.account_no.includes(q) ||
        (a.display_name ?? "").toLowerCase().includes(q)
    );
  }, [accounts, search]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleSavePoints(accountNo: string) {
    const raw = pointsDraft[accountNo];
    const newPointsValue = Number(raw);
    if (raw === undefined || Number.isNaN(newPointsValue) || newPointsValue < 0) {
      showToast("請輸入有效的 CDTB 點數（不可為負數）");
      return;
    }
    setBusyAccountNo(accountNo);
    const res = await fetch(`/api/admin/accounts/${accountNo}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: newPointsValue }),
    });
    const data = await res.json();
    setBusyAccountNo(null);
    if (!res.ok) {
      showToast(data.error ?? "更新失敗");
      return;
    }
    setAccounts((prev) =>
      prev.map((a) => (a.account_no === accountNo ? { ...a, points: newPointsValue } : a))
    );
    showToast("點數已更新");
  }

  async function handleResetPassword(accountNo: string) {
    const raw = passwordDraft[accountNo];
    if (!raw || raw.length < 4) {
      showToast("新密碼至少需要 4 個字元");
      return;
    }
    setBusyAccountNo(accountNo);
    const res = await fetch(`/api/admin/accounts/${accountNo}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_password: raw }),
    });
    const data = await res.json();
    setBusyAccountNo(null);
    if (!res.ok) {
      showToast(data.error ?? "重設失敗");
      return;
    }
    setPasswordDraft((prev) => ({ ...prev, [accountNo]: "" }));
    showToast(`帳號 ${accountNo} 的密碼已重設`);
  }

  async function handleDelete(accountNo: string) {
    if (!confirm(`確定要刪除帳號 ${accountNo} 嗎？這個動作無法復原。`)) return;
    setBusyAccountNo(accountNo);
    const res = await fetch(`/api/admin/accounts/${accountNo}`, { method: "DELETE" });
    const data = await res.json();
    setBusyAccountNo(null);
    if (!res.ok) {
      showToast(data.error ?? "刪除失敗");
      return;
    }
    setAccounts((prev) => prev.filter((a) => a.account_no !== accountNo));
    showToast(`帳號 ${accountNo} 已刪除`);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      showToast("密碼至少需要 4 個字元");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: newDisplayName,
        password: newPassword,
        points: Number(newPoints) || 0,
      }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      showToast(data.error ?? "建立失敗");
      return;
    }
    showToast(`已建立帳號 ${data.account_no}`);
    setNewDisplayName("");
    setNewPassword("");
    setNewPoints("0");
    loadAccounts();
  }

  async function handleSaveOffering(id: number) {
    const draft = offeringDrafts[id];
    if (!draft || Object.keys(draft).length === 0) return;
    setBusyOfferingId(id);
    const res = await fetch(`/api/admin/offerings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await res.json();
    setBusyOfferingId(null);
    if (!res.ok) {
      showToast(data.error ?? "更新失敗");
      return;
    }
    setOfferings((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)));
    setOfferingDrafts((prev) => ({ ...prev, [id]: {} }));
    showToast("供品已更新");
  }

  async function handleToggleActive(offering: Offering) {
    setBusyOfferingId(offering.id);
    const res = await fetch(`/api/admin/offerings/${offering.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !offering.is_active }),
    });
    const data = await res.json();
    setBusyOfferingId(null);
    if (!res.ok) {
      showToast(data.error ?? "更新失敗");
      return;
    }
    setOfferings((prev) => prev.map((o) => (o.id === offering.id ? { ...o, ...data } : o)));
    showToast(data.is_active ? "供品已上架" : "供品已下架");
  }

  async function handleDeleteOffering(offering: Offering) {
    if (!confirm(`確定要刪除「${offering.name}」嗎？`)) return;
    setBusyOfferingId(offering.id);
    const res = await fetch(`/api/admin/offerings/${offering.id}`, { method: "DELETE" });
    const data = await res.json();
    setBusyOfferingId(null);
    if (!res.ok) {
      showToast(data.error ?? "刪除失敗");
      return;
    }
    if (data.mode === "deactivated") {
      setOfferings((prev) => prev.map((o) => (o.id === offering.id ? { ...o, is_active: false } : o)));
      showToast(data.message);
    } else {
      setOfferings((prev) => prev.filter((o) => o.id !== offering.id));
      showToast("供品已刪除");
    }
  }

  async function handleCreateOffering(e: React.FormEvent) {
    e.preventDefault();
    const cost = Number(newOfferingCost);
    if (!newOfferingName.trim()) {
      showToast("請輸入供品名稱");
      return;
    }
    if (Number.isNaN(cost) || cost <= 0) {
      showToast("CDTB 點數必須是大於 0 的數字");
      return;
    }
    setCreatingOffering(true);
    const res = await fetch("/api/admin/offerings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newOfferingName, icon_key: newOfferingIcon, cost }),
    });
    const data = await res.json();
    setCreatingOffering(false);
    if (!res.ok) {
      showToast(data.error ?? "新增失敗");
      return;
    }
    setOfferings((prev) => [...prev, data]);
    setNewOfferingName("");
    setNewOfferingCost("");
    showToast(`已新增供品「${data.name}」`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center">
        <p className="text-goldSoft font-serifTC">載入中…</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-goldSoft mb-4">你沒有後台管理權限</p>
          <Link href="/" className="text-ember font-medium">
            回到首頁
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="font-serifTC text-goldSoft text-xl sm:text-2xl font-bold">
            後台管理｜會員帳號
          </h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/prayers"
              className="text-ink text-sm bg-goldSoft rounded px-3 py-1.5 font-semibold hover:opacity-90"
            >
              今日待祈福／敬獻紀錄
            </Link>
            <Link
              href="/"
              className="text-goldSoft/80 text-sm border border-gold/40 rounded px-3 py-1.5 hover:bg-lacquerDark"
            >
              回到廟門
            </Link>
          </div>
        </div>

        {toast && <div className="mb-4 text-sm text-ink bg-goldSoft rounded px-3 py-2">{toast}</div>}

        {/* 新增帳號 */}
        <form
          onSubmit={handleCreate}
          className="mb-8 rounded-xl border border-gold/40 bg-parchment p-4 sm:p-5 flex flex-wrap gap-3 items-end"
        >
          <div>
            <label className="block text-xs text-ink/70 mb-1">暱稱（選填）</label>
            <input
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="rounded border border-gold/40 px-2 py-1.5 bg-white w-36"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/70 mb-1">初始密碼</label>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded border border-gold/40 px-2 py-1.5 bg-white w-32"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/70 mb-1">初始 CDTB</label>
            <input
              type="number"
              min={0}
              value={newPoints}
              onChange={(e) => setNewPoints(e.target.value)}
              className="rounded border border-gold/40 px-2 py-1.5 bg-white w-24"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="text-sm bg-ember text-parchment rounded px-4 py-2 hover:opacity-90 disabled:opacity-50"
          >
            {creating ? "建立中…" : "＋ 新增帳號"}
          </button>
        </form>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋帳號或暱稱"
          className="w-full mb-5 rounded border border-gold/40 px-3 py-2 bg-parchment focus:outline-none focus:ring-2 focus:ring-ember"
        />

        <div className="rounded-xl border border-gold/40 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-lacquerDark text-goldSoft">
              <tr>
                <th className="text-left px-3 py-2 font-medium">帳號 / 暱稱</th>
                <th className="text-left px-3 py-2 font-medium">CDTB</th>
                <th className="text-left px-3 py-2 font-medium">調整點數</th>
                <th className="text-left px-3 py-2 font-medium">重設密碼</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.account_no} className="bg-parchment border-t border-gold/20 align-top">
                  <td className="px-3 py-2">
                    <p className="text-ink font-medium">
                      {a.account_no}
                      {a.is_admin && <span className="text-ember text-xs ml-1">（管理員）</span>}
                    </p>
                    <p className="text-ink/50 text-xs">{a.display_name || "（無暱稱）"}</p>
                  </td>
                  <td className="px-3 py-2 text-ink">{a.points.toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min={0}
                        placeholder={String(a.points)}
                        value={pointsDraft[a.account_no] ?? ""}
                        onChange={(e) =>
                          setPointsDraft((prev) => ({ ...prev, [a.account_no]: e.target.value }))
                        }
                        className="w-20 rounded border border-gold/40 px-2 py-1 bg-white"
                      />
                      <button
                        onClick={() => handleSavePoints(a.account_no)}
                        disabled={busyAccountNo === a.account_no || !pointsDraft[a.account_no]}
                        className="text-xs bg-lacquer text-goldSoft rounded px-2 py-1 hover:bg-lacquerDark disabled:opacity-40"
                      >
                        更新
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="新密碼"
                        value={passwordDraft[a.account_no] ?? ""}
                        onChange={(e) =>
                          setPasswordDraft((prev) => ({ ...prev, [a.account_no]: e.target.value }))
                        }
                        className="w-24 rounded border border-gold/40 px-2 py-1 bg-white"
                      />
                      <button
                        onClick={() => handleResetPassword(a.account_no)}
                        disabled={busyAccountNo === a.account_no || !passwordDraft[a.account_no]}
                        className="text-xs bg-lacquer text-goldSoft rounded px-2 py-1 hover:bg-lacquerDark disabled:opacity-40"
                      >
                        重設
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDelete(a.account_no)}
                      disabled={busyAccountNo === a.account_no || a.account_no === myAccountNo}
                      className="text-xs border border-lacquer text-lacquer rounded px-2 py-1 hover:bg-lacquer hover:text-goldSoft disabled:opacity-30"
                      title={a.account_no === myAccountNo ? "不能刪除自己目前登入的帳號" : "刪除帳號"}
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-ink/50 px-3 py-6">
                    找不到符合的帳號
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 供品管理 */}
        <div className="flex items-center justify-between mt-10 mb-6">
          <h2 className="font-serifTC text-goldSoft text-xl sm:text-2xl font-bold">
            後台管理｜供品桌
          </h2>
        </div>

        <form
          onSubmit={handleCreateOffering}
          className="mb-8 rounded-xl border border-gold/40 bg-parchment p-4 sm:p-5 flex flex-wrap gap-3 items-end"
        >
          <div>
            <label className="block text-xs text-ink/70 mb-1">供品名稱</label>
            <input
              value={newOfferingName}
              onChange={(e) => setNewOfferingName(e.target.value)}
              className="rounded border border-gold/40 px-2 py-1.5 bg-white w-32"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/70 mb-1">圖示</label>
            <select
              value={newOfferingIcon}
              onChange={(e) => setNewOfferingIcon(e.target.value as Offering["icon_key"])}
              className="rounded border border-gold/40 px-2 py-1.5 bg-white w-32"
            >
              {OFFERING_ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink/70 mb-1">CDTB 點數</label>
            <input
              type="number"
              min={1}
              value={newOfferingCost}
              onChange={(e) => setNewOfferingCost(e.target.value)}
              className="rounded border border-gold/40 px-2 py-1.5 bg-white w-24"
            />
          </div>
          <button
            type="submit"
            disabled={creatingOffering}
            className="text-sm bg-ember text-parchment rounded px-4 py-2 hover:opacity-90 disabled:opacity-50"
          >
            {creatingOffering ? "新增中…" : "＋ 新增供品"}
          </button>
        </form>

        <div className="rounded-xl border border-gold/40 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-lacquerDark text-goldSoft">
              <tr>
                <th className="text-left px-3 py-2 font-medium">供品</th>
                <th className="text-left px-3 py-2 font-medium">名稱</th>
                <th className="text-left px-3 py-2 font-medium">CDTB</th>
                <th className="text-left px-3 py-2 font-medium">狀態</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {offerings.map((o) => {
                const Icon = OFFERING_ICONS[o.icon_key];
                const draft = offeringDrafts[o.id] ?? {};
                return (
                  <tr
                    key={o.id}
                    className={`bg-parchment border-t border-gold/20 align-top ${
                      !o.is_active ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-3 py-2 w-10">
                      <div className="w-8 h-8">
                        <Icon />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        defaultValue={o.name}
                        onChange={(e) =>
                          setOfferingDrafts((prev) => ({
                            ...prev,
                            [o.id]: { ...prev[o.id], name: e.target.value },
                          }))
                        }
                        className="w-28 rounded border border-gold/40 px-2 py-1 bg-white"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        defaultValue={o.cost}
                        onChange={(e) =>
                          setOfferingDrafts((prev) => ({
                            ...prev,
                            [o.id]: { ...prev[o.id], cost: Number(e.target.value) },
                          }))
                        }
                        className="w-24 rounded border border-gold/40 px-2 py-1 bg-white"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleToggleActive(o)}
                        disabled={busyOfferingId === o.id}
                        className={`text-xs rounded px-2 py-1 ${
                          o.is_active
                            ? "bg-lacquer text-goldSoft"
                            : "border border-gold/50 text-ink/60"
                        }`}
                      >
                        {o.is_active ? "上架中" : "已下架"}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleSaveOffering(o.id)}
                          disabled={busyOfferingId === o.id || Object.keys(draft).length === 0}
                          className="text-xs bg-lacquer text-goldSoft rounded px-2 py-1 hover:bg-lacquerDark disabled:opacity-40"
                        >
                          儲存
                        </button>
                        <button
                          onClick={() => handleDeleteOffering(o)}
                          disabled={busyOfferingId === o.id}
                          className="text-xs border border-lacquer text-lacquer rounded px-2 py-1 hover:bg-lacquer hover:text-goldSoft disabled:opacity-30"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {offerings.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-ink/50 px-3 py-6">
                    還沒有供品，用上面的表單新增一個吧
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
