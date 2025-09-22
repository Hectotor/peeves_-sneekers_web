"use client";

import { useState } from "react";
import { auth, db } from "@/services/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage() {
  const backgroundStyle = {
    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url("https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 0',
  };
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!acceptedTerms) {
      setError("Veuvez accepter les conditions générales de vente pour continuer.");
      return;
    }
    
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
    <div style={backgroundStyle}>
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm mx-auto my-8">
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

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-gray-700">
                J'accepte les{' '}
                <a 
                  href="/mentions-legales" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  conditions générales de vente
                </a>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !acceptedTerms}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-gray-400"
            >
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
