import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-5xl font-bold text-brand-600">404</p>
        <h1 className="mt-3 text-xl font-semibold">Page not found</h1>
        <p className="mt-1 text-slate-500">The page you are looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
