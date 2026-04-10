export default function ReportCard({ title, subtitle, children, className = "", action }) {
  return (
    <section
      className={`rounded-lg bg-white p-5 shadow-[0_22px_50px_rgba(35,66,85,0.065)] transition hover:-translate-y-1 hover:shadow-[0_30px_62px_rgba(35,66,85,0.1)] ${className}`}
    >
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm font-semibold text-[#9aa6b2]">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
