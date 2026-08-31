import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4 text-center">
      <div>
        <p className="text-6xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-4 text-xl font-bold text-gray-900">Page introuvable</h1>
        <p className="mt-2 text-gray-500">Cette page n’existe pas ou le site n’est pas encore publié.</p>
        <Link href="/" className="btn btn-primary mt-6">Retour à l’accueil</Link>
      </div>
    </div>
  );
}
