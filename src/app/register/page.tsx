"use client";

import { useState } from "react";
import { auth, db } from "@/services/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Create auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Create user profile in Firestore
      const usersRef = collection(db, "users");
      const userDoc = doc(usersRef, cred.user.uid);
      await setDoc(userDoc, {
        firstName,
        lastName,
        address,
        postalCode,
        city,
        email,
        createdAt: serverTimestamp(),
      });
      // Send email verification
      try {
        await sendEmailVerification(cred.user, {
          url: window.location.origin,
          handleCodeInApp: false,
        });
        const msg = "Un e-mail de confirmation a été envoyé. Veuillez vérifier votre boîte mail pour activer votre compte.";
        setSuccess(msg);
        // Popup et redirection vers la page de connexion après OK
        alert(msg);
        window.location.href = "/login";
      } catch (e) {
        // Même si l'envoi échoue, le compte est créé. On affiche un message et on redirige vers /login
        const msg = "Compte créé. Impossible d'envoyer l'e-mail de confirmation pour le moment. Réessayez depuis la page de connexion.";
        setSuccess(msg);
        alert(msg);
        window.location.href = "/login";
      }
    } catch (err: any) {
      setError(err?.message ?? "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="mt-1 text-sm text-gray-600">Renseignez vos informations pour créer votre compte.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom</label>
              <input id="firstName" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom</label>
              <input id="lastName" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse de livraison</label>
            <input id="address" type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Code postal</label>
              <input id="postalCode" type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ville</label>
              <input id="city" type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
          )}

          <button type="submit" disabled={loading} className={`w-full rounded-md bg-indigo-600 px-4 py-2.5 text-white hover:bg-indigo-500 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}>
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
