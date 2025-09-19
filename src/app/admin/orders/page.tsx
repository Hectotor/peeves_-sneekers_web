"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, getIdTokenResult, type User } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { collection, getDoc, getDocs, orderBy, query, doc as fsDoc, updateDoc } from "firebase/firestore";

type Order = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt?: any;
  items: Array<{ id: string; name: string; qty: number; price: number; size?: string }>;
};

export default function AdminOrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});

  const price = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }),
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
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list: Order[] = [];
        snap.forEach((docu) => list.push({ id: docu.id, ...(docu.data() as any) }));
        setOrders(list);
        // Fetch user profiles for these orders
        const uids = Array.from(new Set(list.map((o) => o.userId).filter(Boolean)));
        const results = await Promise.all(
          uids.map(async (uid) => {
            try {
              const userRef = fsDoc(db, 'users', uid);
              const userSnap = await getDoc(userRef);
              return [uid, userSnap.exists() ? userSnap.data() : null] as const;
            } catch {
              return [uid, null] as const;
            }
          })
        );
        const map: Record<string, any> = {};
        results.forEach(([uid, data]) => { map[uid] = data; });
        setProfiles(map);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const profile = profiles[o.userId] || {};
      const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
      const addressLine = [profile.address, profile.postalCode, profile.city].filter(Boolean).join(' ');
      const created = o.createdAt?.toDate ? o.createdAt.toDate() : undefined;
      const dateStr = created
        ? created.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        : '';
      const amountStr = String(o.amount ?? '');
      const statusStr = String(o.status ?? '').toLowerCase();
      const itemsStr = (o.items || [])
        .map((it) => `${it.name || ''} ${it.size || ''} ${it.qty || ''}`)
        .join(' ') 
        .toLowerCase();
      const haystack = [
        o.id,
        fullName,
        profile.email || '',
        addressLine,
        dateStr,
        amountStr,
        statusStr,
        itemsStr,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, profiles, searchQuery]);

  const statusLabel = (s?: string) => {
    const v = (s || '').toLowerCase();
    if (v === 'paid') return 'Payée';
    if (v === 'prepared') return 'Préparée';
    if (v === 'shipped') return 'Expédiée';
    return s || '—';
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Chargement…</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Administration · Commandes</h1>
        {/* Barre de recherche */}
        <div className="mt-6 flex justify-end">
          <div className="relative w-full md:w-auto md:min-w-[340px]">
            <label htmlFor="admin-orders-search" className="sr-only">Rechercher une commande</label>
            <input
              id="admin-orders-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher (commande, client, adresse, statut, article...)"
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" />
            </svg>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">Commande</th>
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-left">Adresse</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-right">Montant</th>
                <th className="px-4 py-2 text-left">Statut</th>
                <th className="px-4 py-2 text-left">Articles</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const created = o.createdAt?.toDate ? o.createdAt.toDate() : undefined;
                const dateStr = created
                  ? created.toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";
                const itemsCount = o.items?.reduce((acc, it) => acc + (it.qty || 0), 0) ?? 0;
                const profile = profiles[o.userId] || {};
                const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || '—';
                const address = profile.address || '';
                const cp = profile.postalCode || '';
                const city = profile.city || '';
                return (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-2 font-mono">#{o.id}</td>
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-900">{fullName}</div>
                      <div className="text-xs text-gray-500">{profile.email || o.userId}</div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-gray-900">{address || '—'}</div>
                      <div className="text-xs text-gray-500">{[cp, city].filter(Boolean).join(' ')}</div>
                    </td>
                    <td className="px-4 py-2">{dateStr}</td>
                    <td className="px-4 py-2 text-right font-medium">{price.format(o.amount || 0)}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          (o.status || '').toLowerCase() === 'prepared'
                            ? 'bg-green-100 text-green-700'
                            : (o.status || '').toLowerCase() === 'shipped'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                          {statusLabel(o.status)}
                        </span>
                        {((o.status || '').toLowerCase() !== 'prepared') ? (
                          <button
                            className={`rounded border px-2 py-0.5 text-xs ${savingIds[o.id] ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'} `}
                            disabled={!!savingIds[o.id]}
                            onClick={async () => {
                              try {
                                setSavingIds((s) => ({ ...s, [o.id]: true }));
                                const ref = fsDoc(db, 'orders', o.id);
                                await updateDoc(ref, { status: 'prepared' });
                                setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: 'prepared' } : x));
                              } catch (e) {
                                alert('Impossible de marquer la commande comme préparée.');
                              } finally {
                                setSavingIds((s) => ({ ...s, [o.id]: false }));
                              }
                            }}
                          >
                            Marquer préparée
                          </button>
                        ) : (
                          <button
                            className={`rounded border px-2 py-0.5 text-xs ${savingIds[o.id] ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'} `}
                            disabled={!!savingIds[o.id]}
                            onClick={async () => {
                              try {
                                setSavingIds((s) => ({ ...s, [o.id]: true }));
                                const ref = fsDoc(db, 'orders', o.id);
                                await updateDoc(ref, { status: 'paid' });
                                setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: 'paid' } : x));
                              } catch (e) {
                                alert('Impossible d\'annuler l\'état préparée.');
                              } finally {
                                setSavingIds((s) => ({ ...s, [o.id]: false }));
                              }
                            }}
                          >
                            Annuler préparée
                          </button>
                        )}
                        {((o.status || '').toLowerCase() !== 'shipped') && (
                          <button
                            className={`rounded border px-2 py-0.5 text-xs ${savingIds[o.id] ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'} `}
                            disabled={!!savingIds[o.id]}
                            onClick={async () => {
                              try {
                                setSavingIds((s) => ({ ...s, [o.id]: true }));
                                const ref = fsDoc(db, 'orders', o.id);
                                await updateDoc(ref, { status: 'shipped' });
                                setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: 'shipped' } : x));
                              } catch (e) {
                                alert('Impossible de marquer la commande comme expédiée.');
                              } finally {
                                setSavingIds((s) => ({ ...s, [o.id]: false }));
                              }
                            }}
                          >
                            Marquer expédiée
                          </button>
                        )}
                        {((o.status || '').toLowerCase() === 'shipped') && (
                          <button
                            className={`rounded border px-2 py-0.5 text-xs ${savingIds[o.id] ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'} `}
                            disabled={!!savingIds[o.id]}
                            onClick={async () => {
                              try {
                                setSavingIds((s) => ({ ...s, [o.id]: true }));
                                const ref = fsDoc(db, 'orders', o.id);
                                await updateDoc(ref, { status: 'prepared' });
                                setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: 'prepared' } : x));
                              } catch (e) {
                                alert('Impossible d\'annuler l\'état expédiée.');
                              } finally {
                                setSavingIds((s) => ({ ...s, [o.id]: false }));
                              }
                            }}
                          >
                            Annuler expédiée
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="max-w-xs md:max-w-md">
                        {o.items?.length ? (
                          <ul className="list-disc pl-5 space-y-0.5 text-gray-700">
                            {o.items.map((it, idx) => (
                              <li key={idx} className="text-xs md:text-sm">
                                <span className="font-medium">{it.name}</span>
                                {it.size ? <span>{` · T${it.size}`}</span> : null}
                                <span>{` · Qté ${it.qty ?? 1}`}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
                      </div>
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
