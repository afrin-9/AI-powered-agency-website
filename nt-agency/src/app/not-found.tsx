import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-night-950 px-4 text-center text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgb(124_58_237/0.35),transparent_55%)]"
      />
      <div className="relative">
        <Image
          src="/nixo/nixo-face.webp"
          alt="Nixo looking around"
          width={140}
          height={140}
          className="glow-ring mx-auto rounded-full"
        />
        <p className="glow-text mt-6 text-5xl font-bold text-brand-200">404</p>
        <h1 className="mt-3 text-xl font-semibold">Nixo couldn&apos;t find this page</h1>
        <p className="mt-1 text-brand-100/70">The page you are looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
