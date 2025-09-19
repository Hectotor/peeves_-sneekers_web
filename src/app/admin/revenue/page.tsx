"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, getIdTokenResult, type User } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

// Simple revenue page: totals and period filter (last 7/30 days, all)

type Order = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt?: any;
  items: Array<{ id: string; name: string; qty: number; price: number; size?: string }>;
};

type Range = '7d' | '30d' | 'all';

export default function AdminRevenuePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [range, setRange] = useState<Range>('7d');
  const [month, setMonth] = useState<number | 'all'>('all'); // 1-12
  const [year, setYear] = useState<number | 'all'>('all');

  const price = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }),
    []
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        window.location.href = "/login";
        return;
      }
      setUser(u);
      const token = await getIdTokenResult(u, true);
      const admin = !!token.claims?.admin;
      setIsAdmin(admin);
      if (!admin) {
        window.location.href = "/";
        return;
      }
      try {
        // Load last N days or all
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const list: Order[] = [];
        snap.forEach((docu) => list.push({ id: docu.id, ...(docu.data() as any) }));
        setOrders(list);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const yearsAvailable = useMemo(() => {
    const set = new Set<number>();
    orders.forEach((o) => {
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : null;
      if (d) set.add(d.getFullYear());
    });
    const arr = Array.from(set).sort((a, b) => b - a);
    const current = new Date().getFullYear();
    if (!arr.includes(current)) arr.unshift(current);
    return arr;
  }, [orders]);

  const filtered = useMemo(() => {
    // If month/year specified, filter by that calendar period
    if (year !== 'all' || month !== 'all') {
      return orders.filter((o) => {
        const d = o.createdAt?.toDate ? o.createdAt.toDate() : null;
        if (!d) return false;
        const matchYear = year === 'all' ? true : d.getFullYear() === year;
        const matchMonth = month === 'all' ? true : (d.getMonth() + 1) === month;
        return matchYear && matchMonth;
      });
    }
    // Else, fall back to range
    if (range === 'all') return orders;
    const now = Date.now();
    const days = range === '7d' ? 7 : 30;
    const threshold = now - days * 24 * 60 * 60 * 1000;
    return orders.filter((o) => (o.createdAt?.toMillis ? o.createdAt.toMillis() : 0) >= threshold);
  }, [orders, range, month, year]);

  const metrics = useMemo(() => {
    const totalRevenue = filtered.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);
    const totalOrders = filtered.length;
    const totalItems = filtered.reduce((acc, o) => acc + (o.items?.reduce((a, it) => a + (it.qty || 0), 0) || 0), 0);
    const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;
    return { totalRevenue, totalOrders, totalItems, avgOrder };
  }, [filtered]);

  const statusLabel = (s?: string) => {
    const v = (s || '').toLowerCase();
    if (v === 'paid') return 'Payée';
    if (v === 'prepared') return 'Préparée';
    if (v === 'shipped') return 'Expédiée';
    return s || '—';
  };

  // Build daily revenue series for the selected period
  const dailySeries = useMemo(() => {
    // Group by YYYY-MM-DD
    const map = new Map<string, number>();
    filtered.forEach((o) => {
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : null;
      if (!d) return;
      const key = d.toISOString().slice(0, 10); // yyyy-mm-dd
      map.set(key, (map.get(key) || 0) + (Number(o.amount) || 0));
    });
    // Sort by date asc
    const points = Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([k, v]) => ({ date: new Date(k + 'T00:00:00Z'), value: v }));
    return points;
  }, [filtered]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Chargement…</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Administration · Chiffre d'affaires</h1>

        {/* Filtres période */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {([
            { key: '7d', label: '7 jours' },
            { key: '30d', label: '30 jours' },
            { key: 'all', label: 'Tout' },
          ] as const).map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border ${
                range === r.key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {r.label}
            </button>
          ))}

          {/* Sélecteurs mois / année */}
          <div className="ml-auto flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs text-gray-600">Mois</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 hover:bg-gray-50"
            >
              <option value="all">Tous</option>
              {[
                'Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'
              ].map((label, idx) => (
                <option key={label} value={idx + 1}>{label}</option>
              ))}
            </select>
            <label className="text-xs text-gray-600">Année</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 hover:bg-gray-50"
            >
              <option value="all">Toutes</option>
              {yearsAvailable.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

        {/* Courbe du chiffre d'affaires */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Évolution du CA (par jour)</h3>
            <div className="text-xs text-gray-500">{dailySeries.length} jour(s)</div>
          </div>
          {dailySeries.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">Aucune donnée pour la période sélectionnée.</div>
          ) : (
            <Chart daily={dailySeries} />
          )}
        </div>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-500">Chiffre d'affaires</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{price.format(metrics.totalRevenue)}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-500">Commandes</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{metrics.totalOrders}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-500">Articles vendus</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{metrics.totalItems}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-500">Panier moyen</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{price.format(metrics.avgOrder)}</div>
          </div>
        </div>

        {/* Table recent orders */}
        <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">Commande</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-right">Montant</th>
                <th className="px-4 py-2 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((o) => {
                const created = o.createdAt?.toDate ? o.createdAt.toDate() : undefined;
                const dateStr = created
                  ? created.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })
                  : "—";
                return (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-2 font-mono">#{o.id}</td>
                    <td className="px-4 py-2">{dateStr}</td>
                    <td className="px-4 py-2 text-right font-medium">{price.format(o.amount || 0)}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {statusLabel(o.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Lightweight inline chart component (no external deps)
function Chart({ daily }: { daily: Array<{ date: Date; value: number }> }) {
  const width = 900;
  const height = 220;
  const padding = { top: 10, right: 10, bottom: 24, left: 40 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;

  const minDate = daily[0].date.getTime();
  const maxDate = daily[daily.length - 1].date.getTime();
  const maxVal = Math.max(0, ...daily.map((d) => d.value)) || 1;

  const x = (t: number) => padding.left + ((t - minDate) / Math.max(1, maxDate - minDate)) * w;
  const y = (v: number) => padding.top + (1 - v / maxVal) * h;

  const pathLine = daily.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(d.date.getTime())} ${y(d.value)}`).join(' ');
  const pathArea = `${`M ${x(minDate)} ${y(0)}`} ${daily
    .map((d) => `L ${x(d.date.getTime())} ${y(d.value)}`)
    .join(' ')} L ${x(maxDate)} ${y(0)} Z`;

  // Build x ticks: first, middle, last
  const ticks: Array<{ x: number; label: string }> = [];
  const first = new Date(minDate);
  const last = new Date(maxDate);
  const mid = new Date(minDate + (maxDate - minDate) / 2);
  const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { month: 'short', day: '2-digit' });
  ticks.push({ x: x(minDate), label: fmt(first) });
  if (daily.length > 2) ticks.push({ x: x(mid.getTime()), label: fmt(mid) });
  if (daily.length > 1) ticks.push({ x: x(maxDate), label: fmt(last) });

  // y ticks: 0, 50%, 100%
  const yTicks = [0, 0.5, 1].map((r) => ({ y: y(maxVal * r), label: r === 1 ? `${(maxVal).toFixed(0)}` : r === 0.5 ? `${(maxVal / 2).toFixed(0)}` : '0' }));

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="min-w-full">
        {/* grid */}
        {yTicks.map((t, i) => (
          <line key={i} x1={padding.left} x2={width - padding.right} y1={t.y} y2={t.y} stroke="#e5e7eb" strokeWidth={1} />
        ))}
        {/* area */}
        <path d={pathArea} fill="#6366f1" opacity={0.15} />
        {/* line */}
        <path d={pathLine} fill="none" stroke="#6366f1" strokeWidth={2} />
        {/* x axis */}
        {ticks.map((t, i) => (
          <g key={i} transform={`translate(${t.x}, ${height - padding.bottom})`}>
            <line y2={6} stroke="#9ca3af" />
            <text y={18} textAnchor="middle" fontSize={10} fill="#6b7280">{t.label}</text>
          </g>
        ))}
        {/* y axis labels */}
        {yTicks.map((t, i) => (
          <text key={i} x={8} y={t.y + 4} fontSize={10} fill="#6b7280">{t.label}</text>
        ))}
      </svg>
    </div>
  );
}
