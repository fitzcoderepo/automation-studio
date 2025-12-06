import { LoadingState } from "@/components/async-state";

export default function LoadingProduct() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
      <LoadingState label="Loading product details..." />
    </div>
  );
}
