import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-sm text-slate-300">
      <p className="mb-3 text-slate-100">Product not found.</p>
      <Link href="/inventory" className="text-sky-400 hover:text-sky-300">
        Return to inventory
      </Link>
    </div>
  );
}
