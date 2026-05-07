export default function BrandLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-white/72 shadow-[0_12px_30px_rgba(14,165,233,0.12)] backdrop-blur">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-7 w-7 drop-shadow-[0_5px_10px_rgba(59,130,246,0.2)]"
        >
          <path
            d="M12 3.2 18.4 5v5.2c0 4.1-2.5 7.8-6.4 9.6-3.9-1.8-6.4-5.5-6.4-9.6V5L12 3.2Z"
            fill="#60a5fa"
          />
          <path
            d="M12 4.9v13.2c2.9-1.6 4.7-4.6 4.7-7.9V6.3L12 4.9Z"
            fill="#2563eb"
          />
        </svg>
      </div>

      <div>
        <div className="text-[1.65rem] font-black leading-none tracking-tight text-slate-800">
          Vital<span className="text-teal-500">Watch</span>
        </div>
        {!compact && (
          <p className="mt-3 text-[0.72rem] font-bold uppercase tracking-[0.42em] text-slate-500">
            Predictive Health Signal
          </p>
        )}
      </div>
    </div>
  );
}
