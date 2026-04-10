export default function LoadingState({ label = "Loading data..." }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-32 rounded-full bg-[#e4ecef]" />
        <div className="h-24 rounded-lg bg-[#f1f5f7]" />
        <p className="text-sm font-semibold text-[#8d99a5]">{label}</p>
      </div>
    </div>
  );
}
