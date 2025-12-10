type StatusPillProps = {
  status: "connected" | "disconnected" | "loading";
  label?: string;
};

export default function StatusPill({ status, label }: StatusPillProps) {
  if (status === "loading") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-slate-400" />
        {label || "Checking..."}
      </span>
    );
  }

  const connected = status === "connected";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        connected
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      <span
        className={`mr-2 h-2 w-2 rounded-full ${
          connected ? "bg-green-600" : "bg-red-600"
        }`}
      />
      {label || (connected ? "Jobber connected" : "Jobber not connected")}
    </span>
  );
}
