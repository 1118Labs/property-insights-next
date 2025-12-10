type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/90 px-5 py-4 text-sm text-slate-700 shadow-lg shadow-[#021C36]/8 backdrop-blur">
      <div className="text-sm font-semibold text-[#021C36]">
        Page {page} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={prevDisabled}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14D8FF] ${
            prevDisabled
              ? "cursor-not-allowed border-slate-200/70 bg-white/70 text-slate-400"
              : "border-slate-200/90 bg-white text-[#021C36] shadow-sm shadow-[#021C36]/10 hover:-translate-y-0.5 hover:border-[#14D8FF]/60 hover:bg-[#14D8FF]/10 hover:shadow-md"
          }`}
        >
          Previous
        </button>
        <button
          disabled={nextDisabled}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14D8FF] ${
            nextDisabled
              ? "cursor-not-allowed border-slate-200/70 bg-white/70 text-slate-400"
              : "border-transparent bg-gradient-to-r from-[#021C36] to-[#0c345a] text-white shadow-[0_14px_32px_-18px_rgba(2,28,54,0.7)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(20,216,255,0.6)]"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
