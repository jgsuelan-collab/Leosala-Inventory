import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nerooldfbrcomhszexam.supabase.co",
  "sb_publishable_9AnHCHu4VUX70qBg11Dr1w_bpZwaZxu"
);

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function peso(n: number) { return "₱" + parseFloat(String(n || 0)).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function nowStr() { return new Date().toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" } as any); }

const defaultState = () => ({
  warehouses: ["Main Bodega", "Bodega 2"],
  items: [] as any[],
  movements: [] as any[],
  checkers: [] as string[],
});

function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
      background: "#2d5016", color: "#fff", borderRadius: 100, padding: "10px 24px",
      fontSize: 13, fontWeight: 600, zIndex: 1000, boxShadow: "0 8px 30px rgba(45,80,22,.25)",
      whiteSpace: "nowrap", letterSpacing: ".3px", fontFamily: "'DM Sans', sans-serif"
    }}>{msg}</div>
  );
}

function AuthScreen({ onLogin }: { onLogin: (user: any) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit() {
    setError(""); setLoading(true);
    const emailTrim = email.trim().toLowerCase();
    if (!emailTrim.includes("@") || !emailTrim.includes(".")) { setError("Enter a valid email address."); setLoading(false); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }
    if (mode === "register") {
      if (password !== confirm) { setError("Passwords don't match."); setLoading(false); return; }
      const { data, error: err } = await supabase.auth.signUp({ email: emailTrim, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user) onLogin(data.user);
    } else {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email: emailTrim, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user) onLogin(data.user);
    }
    setLoading(false);
  }

  const inp: React.CSSProperties = { width: "100%", border: "1.5px solid #e8e0d0", borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#faf7f2", outline: "none", boxSizing: "border-box", color: "#1a1a1a" };

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🌿</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#2d5016", fontWeight: 700 }}>Leosala Store</div>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9a9a9a", marginTop: 4 }}>Inventory Management</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px 28px 24px", boxShadow: "0 8px 40px rgba(45,80,22,.12)" }}>
          <div style={{ display: "flex", borderRadius: 12, background: "#f4f0e8", padding: 4, marginBottom: 24 }}>
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "9px 0", border: "none", borderRadius: 9, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, background: mode === m ? "#2d5016" : "transparent", color: mode === m ? "#fff" : "#9a9a9a", transition: "all .2s" }}>{m === "login" ? "Log In" : "Register"}</button>
            ))}
          </div>
          {error && <div style={{ background: "#fdecea", color: "#c0392b", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9a9a9a", textTransform: "uppercase", letterSpacing: .7, marginBottom: 6 }}>Email Address</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gmail.com" type="email" style={inp} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
          <div style={{ marginBottom: mode === "register" ? 14 : 22 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9a9a9a", textTransform: "uppercase", letterSpacing: .7, marginBottom: 6 }}>Password</div>
            <div style={{ position: "relative" }}>
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" type={showPw ? "text" : "password"} style={{ ...inp, paddingRight: 44 }} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              <button onClick={() => setShowPw(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9a9a9a" }}>{showPw ? "🙈" : "👁️"}</button>
            </div>
          </div>
          {mode === "register" && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9a9a9a", textTransform: "uppercase", letterSpacing: .7, marginBottom: 6 }}>Confirm Password</div>
              <div style={{ position: "relative" }}>
                <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" type={showConfirm ? "text" : "password"} style={{ ...inp, paddingRight: 44 }} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                <button onClick={() => setShowConfirm(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9a9a9a" }}>{showConfirm ? "🙈" : "👁️"}</button>
              </div>
            </div>
          )}
          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: "#2d5016", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1 }}>{loading ? "Please wait…" : mode === "login" ? "🔑 Log In" : "✨ Create Account"}</button>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#9a9a9a", marginTop: 18 }}>☁️ Your data is securely saved in the cloud — access from any device.</div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [state, setState] = useState<any>(null);
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState("");
  const [editItem, setEditItem] = useState<any>(null);
  const [whFilter, setWhFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [movType, setMovType] = useState("in");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", category: "", warehouse: "", cost: "", qty: "", threshold: "" });
  const [movForm, setMovForm] = useState({ item: "", warehouse: "", qty: "", notes: "", checker: "" });
  const [newWh, setNewWh] = useState("");
  const [newChecker, setNewChecker] = useState("");
  const [editForm, setEditForm] = useState<any>({});
  const [pwForm, setPwForm] = useState({ newPw: "", confirmPw: "" });
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [movDateFilter, setMovDateFilter] = useState("");
  const [movCheckerFilter, setMovCheckerFilter] = useState("All");
  const [movTypeFilter, setMovTypeFilter] = useState("All");
  const [quickModal, setQuickModal] = useState<{ itemId: string; delta: number } | null>(null);
  const [quickChecker, setQuickChecker] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadData(session.user.id); }
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      else { setUser(null); setState(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadData(userId: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("inventory_data").select("data").eq("user_id", userId).single();
      if (error || !data) {
        const def = defaultState();
        def.items = [
          { id: uid(), name: "Rice 25kg", category: "Grains", warehouse: "Main Bodega", cost: 1200, qty: 50, threshold: 10, addedAt: nowStr() },
          { id: uid(), name: "Cooking Oil 1L", category: "Condiments", warehouse: "Main Bodega", cost: 85, qty: 120, threshold: 20, addedAt: nowStr() },
          { id: uid(), name: "Sugar 1kg", category: "Grains", warehouse: "Bodega 2", cost: 62, qty: 80, threshold: 15, addedAt: nowStr() },
          { id: uid(), name: "Soap Bar", category: "Hygiene", warehouse: "Bodega 2", cost: 25, qty: 4, threshold: 10, addedAt: nowStr() },
        ];
        setState(def);
        await saveData(userId, def);
      } else {
        setState({ checkers: [], ...data.data });
      }
    } catch { setState(defaultState()); }
    setLoading(false);
  }

  async function saveData(userId: string, newState: any) {
    setSaving(true);
    await supabase.from("inventory_data").upsert({ user_id: userId, data: newState, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    setSaving(false);
  }

  function handleLogin(u: any) { setUser(u); loadData(u.id); }
  async function handleLogout() { await supabase.auth.signOut(); setUser(null); setState(null); setTab("dashboard"); }

  const updateState = useCallback((updater: (s: any) => any) => {
    setState((prev: any) => {
      const next = updater(prev);
      if (user) saveData(user.id, next);
      return next;
    });
  }, [user]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#faf7f2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", color: "#9a9a9a" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ fontSize: 40, marginBottom: 16 }}>🌿</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#2d5016", marginBottom: 8 }}>Leosala Store</div>
      <div style={{ fontSize: 13 }}>Loading your inventory…</div>
    </div>
  );

  if (!user || !state) return <AuthScreen onLogin={handleLogin} />;

  const { warehouses, items, movements, checkers = [] } = state;
  const dateStr = new Date().toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" });
  const totalVal = items.reduce((s: number, i: any) => s + i.cost * i.qty, 0);
  const lowCount = items.filter((i: any) => i.qty > 0 && i.qty <= i.threshold).length;
  const outCount = items.filter((i: any) => i.qty === 0).length;

  const filteredItems = items.filter((i: any) => {
    const matchWH = whFilter === "All" || i.warehouse === whFilter;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || (i.category || "").toLowerCase().includes(search.toLowerCase());
    return matchWH && matchSearch;
  });

  const filteredMovements = movements.filter((m: any) => {
    const matchDate = !movDateFilter || (m.date || "").includes(movDateFilter.split("-").reverse().map((p: string, i: number) => i === 2 ? p : p.replace(/^0/, "")).join(" ").trim()) || (m.date || "").includes(movDateFilter);
    const matchChecker = movCheckerFilter === "All" || (movCheckerFilter === "" ? !m.checker : m.checker === movCheckerFilter);
    const matchType = movTypeFilter === "All" || m.type === movTypeFilter;
    return matchDate && matchChecker && matchType;
  });

  function addItem() {
    const { name, category, warehouse, cost, qty, threshold } = addForm;
    if (!name.trim()) return showToast("⚠️ Enter item name");
    const wh = warehouse || warehouses[0];
    const c = parseFloat(cost); const q = parseInt(qty);
    if (isNaN(c) || c < 0) return showToast("⚠️ Enter valid cost");
    if (isNaN(q) || q < 0) return showToast("⚠️ Enter valid quantity");
    const item = { id: uid(), name: name.trim(), category: category.trim() || "General", warehouse: wh, cost: c, qty: q, threshold: parseInt(threshold) || 5, addedAt: nowStr() };
    const newMovements = q > 0 ? [{ id: uid(), type: "in", itemId: item.id, itemName: item.name, warehouse: wh, qty: q, notes: "Initial stock", checker: "", date: nowStr() }, ...movements] : movements;
    updateState((s: any) => ({ ...s, items: [...s.items, item], movements: newMovements }));
    setAddForm({ name: "", category: "", warehouse: "", cost: "", qty: "", threshold: "" });
    showToast("✅ Item added!");
  }

  function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    updateState((s: any) => ({ ...s, items: s.items.filter((i: any) => i.id !== id) }));
    showToast("🗑️ Deleted.");
  }

  function quickQty(id: string, delta: number) {
    setQuickChecker("");
    setQuickModal({ itemId: id, delta });
  }

  function confirmQuickQty() {
    if (!quickModal) return;
    const { itemId, delta } = quickModal;
    updateState((s: any) => {
      const items = s.items.map((i: any) => i.id !== itemId ? i : { ...i, qty: Math.max(0, i.qty + delta) });
      const item = s.items.find((i: any) => i.id === itemId);
      const movements = [{ id: uid(), type: delta > 0 ? "in" : "out", itemId, itemName: item.name, warehouse: item.warehouse, qty: Math.abs(delta), notes: "Quick adjust", checker: quickChecker || "", date: nowStr() }, ...s.movements];
      return { ...s, items, movements };
    });
    setQuickModal(null);
    setQuickChecker("");
    showToast(delta > 0 ? "📥 Quick stock in!" : "📤 Quick stock out!");
  }

  function setQty(id: string, val: string) {
    const newQty = parseInt(val);
    if (isNaN(newQty) || newQty < 0) return;
    updateState((s: any) => {
      const item = s.items.find((i: any) => i.id === id);
      const diff = newQty - item.qty;
      const items = s.items.map((i: any) => i.id === id ? { ...i, qty: newQty } : i);
      const movements = diff !== 0 ? [{ id: uid(), type: diff > 0 ? "in" : "out", itemId: id, itemName: item.name, warehouse: item.warehouse, qty: Math.abs(diff), notes: "Manual entry", checker: "", date: nowStr() }, ...s.movements] : s.movements;
      return { ...s, items, movements };
    });
  }

  function saveEdit() {
    updateState((s: any) => {
      const item = s.items.find((i: any) => i.id === editItem.id);
      const newQty = parseInt(editForm.qty);
      const diff = newQty - item.qty;
      const items = s.items.map((i: any) => i.id === editItem.id ? { ...i, name: editForm.name || i.name, category: editForm.category || i.category, cost: parseFloat(editForm.cost) || i.cost, qty: newQty, threshold: parseInt(editForm.threshold) || i.threshold } : i);
      const movements = diff !== 0 ? [{ id: uid(), type: diff > 0 ? "in" : "out", itemId: editItem.id, itemName: editForm.name, warehouse: item.warehouse, qty: Math.abs(diff), notes: "Edit adjustment", checker: "", date: nowStr() }, ...s.movements] : s.movements;
      return { ...s, items, movements };
    });
    setEditItem(null); showToast("✅ Saved!");
  }

  function recordMovement() {
    const itemId = movForm.item || (items[0]?.id);
    const item = items.find((i: any) => i.id === itemId);
    if (!item) return showToast("⚠️ Select an item");
    const qty = parseInt(movForm.qty);
    if (!qty || qty <= 0) return showToast("⚠️ Enter quantity > 0");
    if (movType === "out" && qty > item.qty) return showToast("⚠️ Not enough stock!");
    updateState((s: any) => {
      const items = s.items.map((i: any) => i.id !== itemId ? i : { ...i, qty: movType === "out" ? Math.max(0, i.qty - qty) : i.qty + qty });
      const movements = [{ id: uid(), type: movType, itemId, itemName: item.name, warehouse: movForm.warehouse || item.warehouse, qty, notes: movForm.notes || (movType === "in" ? "Received" : movType === "out" ? "Issued" : "Adjusted"), checker: movForm.checker || "", date: nowStr() }, ...s.movements];
      return { ...s, items, movements };
    });
    setMovForm({ item: "", warehouse: "", qty: "", notes: "", checker: "" });
    showToast(({ in: "📥 Stocked in!", out: "📤 Issued out!", adjustment: "🔧 Adjusted!" } as any)[movType]);
  }

  function addWarehouse() {
    if (!newWh.trim()) return showToast("⚠️ Enter warehouse name");
    if (warehouses.includes(newWh.trim())) return showToast("⚠️ Already exists");
    updateState((s: any) => ({ ...s, warehouses: [...s.warehouses, newWh.trim()] }));
    setNewWh(""); showToast("🏪 Warehouse added!");
  }

  function removeWarehouse(idx: number) {
    const w = warehouses[idx];
    if (items.some((i: any) => i.warehouse === w)) return showToast("⚠️ Move items out first");
    updateState((s: any) => ({ ...s, warehouses: s.warehouses.filter((_: any, i: number) => i !== idx) }));
    showToast("Removed.");
  }

  function addChecker() {
    if (!newChecker.trim()) return showToast("⚠️ Enter checker name");
    if (checkers.includes(newChecker.trim())) return showToast("⚠️ Already exists");
    updateState((s: any) => ({ ...s, checkers: [...(s.checkers || []), newChecker.trim()] }));
    setNewChecker(""); showToast("👤 Checker added!");
  }

  function removeChecker(idx: number) {
    updateState((s: any) => ({ ...s, checkers: s.checkers.filter((_: any, i: number) => i !== idx) }));
    showToast("Removed.");
  }

  async function changePassword() {
    if (pwForm.newPw.length < 6) return showToast("⚠️ Password must be at least 6 characters");
    if (pwForm.newPw !== pwForm.confirmPw) return showToast("⚠️ Passwords don't match");
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
    setPwLoading(false);
    if (error) return showToast("⚠️ " + error.message);
    setPwForm({ newPw: "", confirmPw: "" });
    showToast("✅ Password changed!");
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `leosala-inventory-${new Date().toISOString().slice(0, 10)}.json`; a.click(); showToast("💾 Exported!");
  }

  const S: Record<string, React.CSSProperties> = {
    card: { background: "#fff", borderRadius: 12, padding: "16px 18px", boxShadow: "0 2px 16px rgba(45,80,22,.07)", marginBottom: 12 },
    label: { fontSize: 11, fontWeight: 600, color: "#9a9a9a", textTransform: "uppercase", letterSpacing: .7, marginBottom: 5, display: "block" },
    input: { border: "1.5px solid #e8e0d0", borderRadius: 10, padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#faf7f2", color: "#1a1a1a", outline: "none", width: "100%", boxSizing: "border-box" },
    btn: { border: "none", borderRadius: 10, padding: "11px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: .3 },
    sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#2d5016", marginBottom: 12, marginTop: 4, display: "block" },
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf7f2", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "#2d5016", color: "#fff", padding: "16px 20px 0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(0,0,0,.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 21 }}>🌿 Leosala Store</div>
            <div style={{ fontSize: 10, opacity: .65, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 1 }}>Inventory Management</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, opacity: .6, marginBottom: 4 }}>{dateStr}</div>
            <button onClick={handleLogout} style={{ ...S.btn, background: "rgba(255,255,255,.12)", color: "#fff", fontSize: 11, padding: "5px 12px" }}>Sign Out</button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 10 }}>
          <div style={{ fontSize: 11, opacity: .5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>👤 {user.email}</div>
          {saving && <div style={{ fontSize: 10, opacity: .6, whiteSpace: "nowrap" }}>☁️ Saving…</div>}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#2d5016", zIndex: 100, display: "flex", boxShadow: "0 -2px 20px rgba(0,0,0,.2)" }}>
        {[["dashboard", "📊", "Dashboard"], ["inventory", "📦", "Inventory"], ["movements", "🔄", "In/Out"], ["report", "📋", "Report"], ["settings", "⚙️", "Settings"]].map(([t, icon, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: "none", border: "none", padding: "10px 4px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, borderTop: tab === t ? "2px solid #ffd166" : "2px solid transparent" }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 9, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: tab === t ? "#ffd166" : "rgba(255,255,255,.5)", letterSpacing: .3 }}>{label}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 680, margin: "0 auto", paddingBottom: 90 }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div>
            <br />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={{ ...S.card, gridColumn: "1/-1", borderLeft: "3px solid #2d5016", marginBottom: 0 }}>
                <span style={S.label}>Total Inventory Value</span>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#2d5016" }}>{peso(totalVal)}</div>
                <div style={{ fontSize: 11, color: "#9a9a9a", marginTop: 2 }}>{items.reduce((s: number, i: any) => s + i.qty, 0)} total units · {warehouses.length} warehouses</div>
              </div>
              <div style={{ ...S.card, borderLeft: "3px solid #4a7a28", marginBottom: 0 }}>
                <span style={S.label}>Total SKUs</span>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#2d5016" }}>{items.length}</div>
                <div style={{ fontSize: 11, color: "#9a9a9a" }}>Unique items</div>
              </div>
              <div style={{ ...S.card, borderLeft: "3px solid #e8a020", marginBottom: 0 }}>
                <span style={S.label}>Low / Out Stock</span>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#e8a020" }}>{lowCount + outCount}</div>
                <div style={{ fontSize: 11, color: "#9a9a9a" }}>Items to restock</div>
              </div>
            </div>
            <span style={S.sectionTitle}>By Warehouse</span>
            {warehouses.map((w: string) => {
              const whItems = items.filter((i: any) => i.warehouse === w);
              const whVal = whItems.reduce((s: number, i: any) => s + i.cost * i.qty, 0);
              return (
                <div key={w} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>🏪 {w}</div><div style={{ fontSize: 11, color: "#9a9a9a", marginTop: 2 }}>{whItems.length} SKUs · {whItems.reduce((s: number, i: any) => s + i.qty, 0)} units</div></div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#2d5016" }}>{peso(whVal)}</div>
                </div>
              );
            })}
            <span style={{ ...S.sectionTitle, marginTop: 16, display: "block" }}>Recent Activity</span>
            {movements.length === 0 ? <div style={{ textAlign: "center", padding: "30px 0", color: "#9a9a9a", fontSize: 13 }}>🔄 No movements yet.</div> : movements.slice(0, 5).map((m: any) => <MovRow key={m.id} m={m} />)}
          </div>
        )}

        {/* INVENTORY */}
        {tab === "inventory" && (
          <div>
            <br />
            <div style={S.card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2d5016", marginBottom: 14, textTransform: "uppercase", letterSpacing: .8 }}>➕ Add New Item</div>
              <div style={{ marginBottom: 10 }}><span style={S.label}>Item Name</span><input style={S.input} placeholder="e.g. Rice 25kg" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><span style={S.label}>Category</span><input style={S.input} placeholder="e.g. Grains" value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))} /></div>
                <div><span style={S.label}>Warehouse</span>
                  <select style={{ ...S.input, appearance: "none" }} value={addForm.warehouse || warehouses[0]} onChange={e => setAddForm(f => ({ ...f, warehouse: e.target.value }))}>
                    {warehouses.map((w: string) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div><span style={S.label}>Cost/Unit (₱)</span><input style={S.input} type="number" placeholder="0.00" value={addForm.cost} onChange={e => setAddForm(f => ({ ...f, cost: e.target.value }))} /></div>
                <div><span style={S.label}>Qty on Hand</span><input style={S.input} type="number" placeholder="0" value={addForm.qty} onChange={e => setAddForm(f => ({ ...f, qty: e.target.value }))} /></div>
                <div><span style={S.label}>Low Stock Alert</span><input style={S.input} type="number" placeholder="5" value={addForm.threshold} onChange={e => setAddForm(f => ({ ...f, threshold: e.target.value }))} /></div>
              </div>
              <button style={{ ...S.btn, background: "#2d5016", color: "#fff", width: "100%", textAlign: "center" }} onClick={addItem}>✓ Add Item to Inventory</button>
            </div>
            <span style={S.sectionTitle}>Inventory List</span>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", marginBottom: 12 }}>
              {["All", ...warehouses].map((w: string) => (
                <div key={w} onClick={() => setWhFilter(w)} style={{ background: whFilter === w ? "#2d5016" : "#fff", border: `1.5px solid ${whFilter === w ? "#2d5016" : "#e8e0d0"}`, borderRadius: 100, padding: "7px 16px", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", color: whFilter === w ? "#fff" : "#5a5a5a" }}>{w}</div>
              ))}
            </div>
            <input style={{ ...S.input, marginBottom: 12, background: "#fff" }} placeholder="🔍 Search items..." value={search} onChange={e => setSearch(e.target.value)} />
            {whFilter !== "All" && (() => {
              const whTotal = filteredItems.reduce((s: number, i: any) => s + i.cost * i.qty, 0);
              return <div style={{ background: "linear-gradient(135deg,#2d5016,#4a7a28)", borderRadius: 12, padding: "14px 18px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div><div style={{ fontSize: 11, opacity: .8, textTransform: "uppercase", letterSpacing: 1 }}>{whFilter}</div><div style={{ fontSize: 11, opacity: .65 }}>{filteredItems.length} items</div></div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}>{peso(whTotal)}</div>
              </div>;
            })()}
            {filteredItems.length === 0 ? <div style={{ textAlign: "center", padding: "40px 0", color: "#9a9a9a" }}>📦 No items found.</div> :
              filteredItems.map((i: any) => {
                const borderCol = i.qty === 0 ? "#c0392b" : i.qty <= i.threshold ? "#e8a020" : "transparent";
                const badge = i.qty === 0 ? <span style={{ background: "#fdecea", color: "#c0392b", borderRadius: 100, padding: "2px 10px", fontSize: 10, fontWeight: 700 }}>Out of Stock</span>
                  : i.qty <= i.threshold ? <span style={{ background: "#fff8e1", color: "#f57f17", borderRadius: 100, padding: "2px 10px", fontSize: 10, fontWeight: 700 }}>Low Stock</span>
                    : <span style={{ background: "#e8f5e9", color: "#2e7d32", borderRadius: 100, padding: "2px 10px", fontSize: 10, fontWeight: 700 }}>In Stock</span>;
                return (
                  <div key={i.id} style={{ ...S.card, borderLeft: `3px solid ${borderCol}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div><div style={{ fontWeight: 600, fontSize: 14 }}>{i.name}</div><div style={{ fontSize: 10, color: "#9a9a9a", textTransform: "uppercase", letterSpacing: .8, marginTop: 1 }}>{i.category} · {i.warehouse}</div></div>
                      <div style={{ textAlign: "right" }}><div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#2d5016" }}>{peso(i.cost * i.qty)}</div><div style={{ fontSize: 10, color: "#9a9a9a" }}>{peso(i.cost)} × {i.qty}</div></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: "1px solid #e8e0d0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {badge}
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button onClick={() => quickQty(i.id, -1)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "#f4f0e8", color: "#c0392b", fontSize: 16, cursor: "pointer", fontWeight: 700 }}>−</button>
                          <input type="number" defaultValue={i.qty} key={i.qty} onBlur={e => setQty(i.id, e.target.value)} style={{ width: 48, textAlign: "center", border: "1.5px solid #e8e0d0", borderRadius: 6, fontSize: 13, fontWeight: 600, padding: 4, fontFamily: "'DM Sans', sans-serif" }} />
                          <button onClick={() => quickQty(i.id, 1)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "#f4f0e8", color: "#2d5016", fontSize: 16, cursor: "pointer", fontWeight: 700 }}>+</button>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => { setEditItem(i); setEditForm({ name: i.name, category: i.category, cost: i.cost, qty: i.qty, threshold: i.threshold }); }} style={{ ...S.btn, background: "transparent", border: "1.5px solid #e8e0d0", padding: "6px 12px", fontSize: 12 }}>✏️</button>
                        <button onClick={() => deleteItem(i.id)} style={{ ...S.btn, background: "transparent", color: "#c0392b", border: "none", padding: "6px 10px", fontSize: 12 }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* MOVEMENTS */}
        {tab === "movements" && (
          <div>
            <br />
            <div style={S.card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2d5016", marginBottom: 14, textTransform: "uppercase", letterSpacing: .8 }}>📝 Record Movement</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {([["in", "📥 Stock In", "#e8f5e9", "#2e7d32"], ["out", "📤 Stock Out", "#fdecea", "#c0392b"], ["adjustment", "🔧 Adjust", "#e3f2fd", "#1565c0"]] as const).map(([t, label, bg, col]) => (
                  <div key={t} onClick={() => setMovType(t)} style={{ flex: 1, padding: "10px 8px", textAlign: "center", borderRadius: 10, border: `1.5px solid ${movType === t ? col : "#e8e0d0"}`, fontSize: 12, fontWeight: 600, cursor: "pointer", background: movType === t ? bg : "#fff", color: movType === t ? col : "#9a9a9a" }}>{label}</div>
                ))}
              </div>
              <div style={{ marginBottom: 10 }}>
                <span style={S.label}>Select Item</span>
                <select style={{ ...S.input, appearance: "none" }} value={movForm.item || (items[0]?.id || "")} onChange={e => setMovForm(f => ({ ...f, item: e.target.value }))}>
                  {items.length === 0 ? <option>— No items yet —</option> : items.map((i: any) => <option key={i.id} value={i.id}>{i.name} ({i.warehouse})</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><span style={S.label}>Warehouse</span>
                  <select style={{ ...S.input, appearance: "none" }} value={movForm.warehouse || warehouses[0]} onChange={e => setMovForm(f => ({ ...f, warehouse: e.target.value }))}>
                    {warehouses.map((w: string) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div><span style={S.label}>Quantity</span><input style={S.input} type="number" placeholder="0" value={movForm.qty} onChange={e => setMovForm(f => ({ ...f, qty: e.target.value }))} /></div>
              </div>

              {/* Checker */}
              <div style={{ marginBottom: 10 }}>
                <span style={S.label}>👤 Checker / Person in Charge</span>
                <select style={{ ...S.input, appearance: "none" }} value={movForm.checker} onChange={e => setMovForm(f => ({ ...f, checker: e.target.value }))}>
                  <option value="">— Select checker (optional) —</option>
                  {checkers.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
                {checkers.length === 0 && <div style={{ fontSize: 11, color: "#9a9a9a", marginTop: 4 }}>Add checkers in ⚙️ Settings first.</div>}
              </div>

              <div style={{ marginBottom: 14 }}>
                <span style={S.label}>Notes / Reason</span>
                <input style={S.input} placeholder="e.g. Sales, Delivery received..." value={movForm.notes} onChange={e => setMovForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <button style={{ ...S.btn, background: "#2d5016", color: "#fff", width: "100%", textAlign: "center" }} onClick={recordMovement}>✓ Record Movement</button>
            </div>

            {/* History Filters */}
            <span style={S.sectionTitle}>Movement History</span>
            <div style={S.card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2d5016", marginBottom: 12, textTransform: "uppercase", letterSpacing: .8 }}>🔍 Filter History</div>
              <div style={{ marginBottom: 10 }}>
                <span style={S.label}>📅 Filter by Date</span>
                <input style={S.input} type="date" value={movDateFilter} onChange={e => setMovDateFilter(e.target.value)} max={new Date().toISOString().split("T")[0]} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <span style={S.label}>👤 By Checker</span>
                  <select style={{ ...S.input, appearance: "none" }} value={movCheckerFilter} onChange={e => setMovCheckerFilter(e.target.value)}>
                    <option value="All">All Checkers</option>
                    <option value="">No Checker</option>
                    {checkers.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <span style={S.label}>📦 By Type</span>
                  <select style={{ ...S.input, appearance: "none" }} value={movTypeFilter} onChange={e => setMovTypeFilter(e.target.value)}>
                    <option value="All">All Types</option>
                    <option value="in">📥 Stock In</option>
                    <option value="out">📤 Stock Out</option>
                    <option value="adjustment">🔧 Adjustment</option>
                  </select>
                </div>
              </div>
              {(movDateFilter || movCheckerFilter !== "All" || movTypeFilter !== "All") && (
                <button onClick={() => { setMovDateFilter(""); setMovCheckerFilter("All"); setMovTypeFilter("All"); }} style={{ ...S.btn, background: "transparent", color: "#c0392b", border: "1.5px solid #fdecea", width: "100%", textAlign: "center", marginTop: 10, fontSize: 12 }}>✕ Clear All Filters</button>
              )}
            </div>

            {(movDateFilter || movCheckerFilter !== "All" || movTypeFilter !== "All") && (
              <div style={{ fontSize: 12, color: "#9a9a9a", marginBottom: 10, textAlign: "center" }}>
                Showing <strong>{filteredMovements.length}</strong> of {movements.length} movements
              </div>
            )}

            {filteredMovements.length === 0
              ? <div style={{ textAlign: "center", padding: "30px 0", color: "#9a9a9a", fontSize: 13 }}>🔄 No movements found for this filter.</div>
              : filteredMovements.slice(0, 100).map((m: any) => <MovRow key={m.id} m={m} />)
            }
          </div>
        )}

        {/* REPORT */}
        {tab === "report" && (
          <div>
            <br />
            <div style={{ ...S.card, borderLeft: "3px solid #2d5016" }}>
              <span style={S.label}>Grand Total Inventory Value</span>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#2d5016" }}>{peso(totalVal)}</div>
              <div style={{ fontSize: 11, color: "#9a9a9a", marginTop: 2 }}>As of {new Date().toLocaleDateString("en-PH", { dateStyle: "full" } as any)}</div>
            </div>
            {warehouses.map((w: string) => {
              const wItems = items.filter((i: any) => i.warehouse === w);
              if (wItems.length === 0) return null;
              const whTotal = wItems.reduce((s: number, i: any) => s + i.cost * i.qty, 0);
              return (
                <div key={w} style={{ marginBottom: 18 }}>
                  <div style={{ background: "#2d5016", color: "#fff", padding: "10px 16px", borderRadius: "10px 10px 0 0", fontWeight: 600, fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                    <span>🏪 {w}</span><span>{peso(whTotal)}</span>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 2px 16px rgba(45,80,22,.07)" }}>
                    <thead><tr style={{ background: "#f4f0e8" }}>{["Item", "Category", "Cost/Unit", "Qty", "Value"].map(h => <th key={h} style={{ padding: "8px 12px", fontSize: 10, textTransform: "uppercase", letterSpacing: .8, color: "#9a9a9a", textAlign: "left", fontWeight: 600 }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {wItems.map((i: any) => (
                        <tr key={i.id} style={{ borderTop: "1px solid #e8e0d0" }}>
                          <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "#2d5016" }}>{i.name}</td>
                          <td style={{ padding: "10px 12px", fontSize: 12 }}>{i.category}</td>
                          <td style={{ padding: "10px 12px", fontSize: 12 }}>{peso(i.cost)}</td>
                          <td style={{ padding: "10px 12px", fontSize: 12 }}>{i.qty}</td>
                          <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "#2d5016" }}>{peso(i.cost * i.qty)}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: "1px solid #e8e0d0", background: "#e8f5e9" }}>
                        <td colSpan={4} style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#2d5016" }}>Warehouse Total</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#2d5016" }}>{peso(whTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div>
            <br />
            {/* Warehouses */}
            <div style={S.card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2d5016", marginBottom: 14, textTransform: "uppercase", letterSpacing: .8 }}>🏪 Manage Warehouses</div>
              <div style={{ marginBottom: 14 }}><span style={S.label}>New Warehouse Name</span><input style={S.input} placeholder="e.g. Bodega A" value={newWh} onChange={e => setNewWh(e.target.value)} onKeyDown={e => e.key === "Enter" && addWarehouse()} /></div>
              <button style={{ ...S.btn, background: "#2d5016", color: "#fff", width: "100%", textAlign: "center", marginBottom: 16 }} onClick={addWarehouse}>✓ Add Warehouse</button>
              {warehouses.map((w: string, idx: number) => (
                <div key={w} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #e8e0d0" }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>🏪 {w}</span>
                  {idx > 0 ? <button onClick={() => removeWarehouse(idx)} style={{ ...S.btn, background: "transparent", color: "#c0392b", border: "none", padding: "4px 8px", fontSize: 12 }}>Remove</button> : <span style={{ fontSize: 11, color: "#9a9a9a" }}>Default</span>}
                </div>
              ))}
            </div>

            {/* Checkers */}
            <div style={S.card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2d5016", marginBottom: 6, textTransform: "uppercase", letterSpacing: .8 }}>👤 Manage Checkers</div>
              <div style={{ fontSize: 12, color: "#9a9a9a", marginBottom: 14 }}>Checkers are people who verify and record stock movements in the bodegas.</div>
              <div style={{ marginBottom: 14 }}><span style={S.label}>New Checker Name</span><input style={S.input} placeholder="e.g. Juan dela Cruz" value={newChecker} onChange={e => setNewChecker(e.target.value)} onKeyDown={e => e.key === "Enter" && addChecker()} /></div>
              <button style={{ ...S.btn, background: "#2d5016", color: "#fff", width: "100%", textAlign: "center", marginBottom: 16 }} onClick={addChecker}>✓ Add Checker</button>
              {checkers.length === 0
                ? <div style={{ fontSize: 13, color: "#9a9a9a", textAlign: "center", padding: "8px 0" }}>No checkers added yet.</div>
                : checkers.map((c: string, idx: number) => (
                  <div key={c} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #e8e0d0" }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>👤 {c}</span>
                    <button onClick={() => removeChecker(idx)} style={{ ...S.btn, background: "transparent", color: "#c0392b", border: "none", padding: "4px 8px", fontSize: 12 }}>Remove</button>
                  </div>
                ))}
            </div>

            {/* Change Password */}
            <div style={S.card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2d5016", marginBottom: 14, textTransform: "uppercase", letterSpacing: .8 }}>🔐 Change Password</div>
              <div style={{ marginBottom: 10 }}>
                <span style={S.label}>New Password</span>
                <div style={{ position: "relative" }}>
                  <input style={{ ...S.input, paddingRight: 44 }} type={showNewPw ? "text" : "password"} placeholder="Min. 6 characters" value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} />
                  <button onClick={() => setShowNewPw(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9a9a9a" }}>{showNewPw ? "🙈" : "👁️"}</button>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <span style={S.label}>Confirm New Password</span>
                <div style={{ position: "relative" }}>
                  <input style={{ ...S.input, paddingRight: 44 }} type={showConfirmPw ? "text" : "password"} placeholder="Repeat new password" value={pwForm.confirmPw} onChange={e => setPwForm(f => ({ ...f, confirmPw: e.target.value }))} />
                  <button onClick={() => setShowConfirmPw(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9a9a9a" }}>{showConfirmPw ? "🙈" : "👁️"}</button>
                </div>
              </div>
              <button onClick={changePassword} disabled={pwLoading} style={{ ...S.btn, background: "#2d5016", color: "#fff", width: "100%", textAlign: "center", opacity: pwLoading ? .7 : 1 }}>{pwLoading ? "Saving…" : "🔐 Update Password"}</button>
            </div>

            {/* Data Management */}
            <div style={S.card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2d5016", marginBottom: 14, textTransform: "uppercase", letterSpacing: .8 }}>⚠️ Data Management</div>
              <button onClick={exportData} style={{ ...S.btn, background: "transparent", border: "1.5px solid #e8e0d0", color: "#2d5016", width: "100%", textAlign: "center", marginBottom: 10 }}>💾 Export Data (JSON)</button>
              <button onClick={() => { if (confirm("Clear ALL inventory data? This cannot be undone.")) { updateState((s: any) => ({ ...s, items: [], movements: [] })); showToast("Cleared."); } }} style={{ ...S.btn, background: "transparent", color: "#c0392b", border: "1.5px solid #fdecea", width: "100%", textAlign: "center" }}>🗑️ Clear All Data</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(2px)" }} onClick={e => e.target === e.currentTarget && setEditItem(null)}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: 680, boxShadow: "0 -8px 40px rgba(45,80,22,.14)" }}>
            <div style={{ width: 36, height: 4, background: "#e8e0d0", borderRadius: 100, margin: "0 auto 18px" }} />
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#2d5016", marginBottom: 16 }}>Edit Item</div>
            <div style={{ marginBottom: 10 }}><span style={S.label}>Item Name</span><input style={S.input} value={editForm.name} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div><span style={S.label}>Category</span><input style={S.input} value={editForm.category} onChange={e => setEditForm((f: any) => ({ ...f, category: e.target.value }))} /></div>
              <div><span style={S.label}>Cost / Unit (₱)</span><input style={S.input} type="number" step="0.01" value={editForm.cost} onChange={e => setEditForm((f: any) => ({ ...f, cost: e.target.value }))} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              <div><span style={S.label}>Qty on Hand</span><input style={S.input} type="number" value={editForm.qty} onChange={e => setEditForm((f: any) => ({ ...f, qty: e.target.value }))} /></div>
              <div><span style={S.label}>Low Stock Alert</span><input style={S.input} type="number" value={editForm.threshold} onChange={e => setEditForm((f: any) => ({ ...f, threshold: e.target.value }))} /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditItem(null)} style={{ ...S.btn, flex: 1, background: "transparent", border: "1.5px solid #e8e0d0", color: "#5a5a5a", textAlign: "center" }}>Cancel</button>
              <button onClick={saveEdit} style={{ ...S.btn, flex: 2, background: "#2d5016", color: "#fff", textAlign: "center" }}>✓ Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Checker Modal */}
      {quickModal && (() => {
        const item = items.find((i: any) => i.id === quickModal.itemId);
        const isOut = quickModal.delta < 0;
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(2px)" }}
            onClick={e => e.target === e.currentTarget && setQuickModal(null)}>
            <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: 680, boxShadow: "0 -8px 40px rgba(45,80,22,.18)" }}>
              <div style={{ width: 36, height: 4, background: "#e8e0d0", borderRadius: 100, margin: "0 auto 18px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: isOut ? "#fdecea" : "#e8f5e9" }}>
                  {isOut ? "📤" : "📥"}
                </div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#2d5016" }}>Quick {isOut ? "Stock Out" : "Stock In"}</div>
                  <div style={{ fontSize: 12, color: "#9a9a9a" }}>{item?.name} · {isOut ? "−1 unit" : "+1 unit"}</div>
                </div>
              </div>
              <div style={{ background: "#faf7f2", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#5a5a5a" }}>
                📦 Current stock: <strong>{item?.qty}</strong> → After: <strong style={{ color: isOut ? "#c0392b" : "#2e7d32" }}>{isOut ? Math.max(0, (item?.qty || 0) - 1) : (item?.qty || 0) + 1}</strong>
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={S.label}>👤 Checker / Person in Charge <span style={{ color: "#c0392b" }}>*</span></span>
                {checkers.length > 0 ? (
                  <select style={{ ...S.input, appearance: "none" }} value={quickChecker} onChange={e => setQuickChecker(e.target.value)}>
                    <option value="">— Select checker —</option>
                    {checkers.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input style={S.input} placeholder="Enter checker name" value={quickChecker} onChange={e => setQuickChecker(e.target.value)} />
                )}
                {checkers.length === 0 && <div style={{ fontSize: 11, color: "#9a9a9a", marginTop: 4 }}>Tip: Add checkers in ⚙️ Settings to use a dropdown.</div>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setQuickModal(null)} style={{ ...S.btn, flex: 1, background: "transparent", border: "1.5px solid #e8e0d0", color: "#5a5a5a", textAlign: "center" }}>Cancel</button>
                <button onClick={confirmQuickQty} style={{ ...S.btn, flex: 2, background: isOut ? "#c0392b" : "#2d5016", color: "#fff", textAlign: "center" }}>
                  {isOut ? "📤 Confirm Stock Out" : "📥 Confirm Stock In"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <Toast msg={toast} />
    </div>
  );
}

function MovRow({ m }: { m: any }) {
  const icons: any = { in: "📥", out: "📤", adjustment: "🔧" };
  const iconBg: any = { in: "#e8f5e9", out: "#fdecea", adjustment: "#e3f2fd" };
  const qtyColor = m.type === "in" ? "#2e7d32" : m.type === "out" ? "#c0392b" : "#1565c0";
  const qtyLabel = m.type === "in" ? `+${m.qty}` : m.type === "out" ? `−${m.qty}` : `±${m.qty}`;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: "#fff", borderRadius: 10, boxShadow: "0 2px 12px rgba(45,80,22,.06)", marginBottom: 8 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, background: iconBg[m.type], flexShrink: 0 }}>{icons[m.type]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{m.itemName}</div>
        <div style={{ fontSize: 11, color: "#9a9a9a", marginTop: 2 }}>{m.warehouse} · {m.notes} · {m.date}</div>
        {m.checker && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#f4f0e8", borderRadius: 100, padding: "2px 8px", fontSize: 10, fontWeight: 600, color: "#2d5016", marginTop: 4 }}>
            👤 {m.checker}
          </div>
        )}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: qtyColor, flexShrink: 0 }}>{qtyLabel}</div>
    </div>
  );
}
