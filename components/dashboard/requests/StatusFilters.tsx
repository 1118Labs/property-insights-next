export type StatusOption = {
  value: string;
  label: string;
  count: number;
};

type StatusFiltersProps = {
  options: StatusOption[];
  active: string;
  onChange: (value: string) => void;
};

export default function StatusFilters({
  options,
  active,
  onChange,
}: StatusFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
            active === option.value
              ? "border-slate-300 bg-slate-100 text-slate-900"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              active === option.value ? "bg-[#0A84FF]" : "bg-slate-300"
            }`}
          />
          <span className="capitalize">{option.label}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              active === option.value
                ? "bg-white text-slate-900"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {option.count}
          </span>
        </button>
      ))}
    </div>
  );
}
