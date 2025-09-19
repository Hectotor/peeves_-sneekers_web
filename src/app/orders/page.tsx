"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import Link from "next/link";

type Order = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt?: any;
  items: Array<{ id: string; name: string; qty: number; price: number; size?: string }>;
};

export default function OrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const price = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }),
    []
  );

  function statusLabel(s?: string) {
    const v = (s || '').toLowerCase();
    if (v === 'paid') return 'Payée';
    if (v === 'prepared') return 'Préparée';
    if (v === 'shipped') return 'Expédiée';
    return s || '—';
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        window.location.href = "/login";
        return;
      }
      setUser(u);
      // Load orders with fallback if composite index is missing
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", u.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list: Order[] = [];
        snap.forEach((docu) => {
          const data = docu.data() as any;
          list.push({ id: docu.id, ...data });
        });
        setOrders(list);
      } catch (e: any) {
        console.warn("Orders query with orderBy failed, retrying without orderBy.", e?.message || e);
        try {
          const q2 = query(
            collection(db, "orders"),
            where("userId", "==", u.uid)
          );
          const snap2 = await getDocs(q2);
          const list2: Order[] = [];
          snap2.forEach((docu) => {
            const data = docu.data() as any;
            list2.push({ id: docu.id, ...data });
          });
          // Sort client-side by createdAt desc
          list2.sort((a, b) => {
            const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return tb - ta;
          });
          setOrders(list2);
        } catch (e2) {
          console.error("Orders fallback query failed:", e2);
          setOrders([]);
        }
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Chargement…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-600">
            <p>Aucune commande pour le moment.</p>
            <p className="mt-2 text-xs text-gray-500">Si vous venez de passer une commande, patientez quelques secondes puis actualisez. Assurez-vous aussi d'être connecté avec le bon compte.</p>
            <Link href="/" className="mt-4 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500">Commencer mes achats</Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((o) => {
              const created = o.createdAt?.toDate ? o.createdAt.toDate() : undefined;
              const dateStr = created
                ? created.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })
                : "—";
              const itemsCount = o.items?.reduce((acc, it) => acc + (it.qty || 0), 0) ?? 0;
              const isOpen = openIds[o.id];
              return (
                <div key={o.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-gray-500">Commande</div>
                      <div className="font-mono text-sm text-gray-900">#{o.id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="text-sm text-gray-900">{dateStr}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Montant</div>
                      <div className="text-sm font-semibold text-gray-900">{price.format(o.amount || 0)}</div>
                    </div>
                    <div>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {statusLabel(o.status)}
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={() => setOpenIds((prev) => ({ ...prev, [o.id]: !isOpen }))}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        {isOpen ? 'Masquer les articles' : 'Voir les articles'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">{itemsCount} article(s)</div>
                  {isOpen && (
                    <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
                      {o.items?.map((it, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between gap-4 text-sm">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{it.name}</div>
                            <div className="text-gray-500">Taille {it.size ?? '—'} · Qté {it.qty ?? 1}</div>
                          </div>
                          <div className="text-gray-900 font-medium">{price.format((it.price || 0) * (it.qty || 1))}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
