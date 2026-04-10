import ReportCard from "./ReportCard";
import EmptyState from "../common/EmptyState";

function Legend() {
  return (
    <div className="flex items-center gap-4 text-xs font-black text-[#6b7884]">
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#13977f]" />
        Income
      </span>
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2d8ce9]" />
        Expenses
      </span>
    </div>
  );
}

export default function MonthlyComparisonCard({ data = [] }) {
  return (
    <ReportCard title="Monthly Comparison" subtitle="Trend over the last 6 months" action={<Legend />}>
      <div className="relative h-[270px] overflow-hidden rounded-lg bg-gradient-to-b from-white to-[#fbfdfe]">
        {data.length > 0 ? (
          <svg className="h-full w-full" viewBox="0 0 720 270" preserveAspectRatio="none">
          <defs>
            <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#13977f" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#13977f" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2d8ce9" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#2d8ce9" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[55, 105, 155, 205].map((y) => (
            <line key={y} x1="25" x2="695" y1={y} y2={y} stroke="#edf2f5" strokeWidth="1" />
          ))}
          <path d="M35 195 C88 150 111 142 155 152 C212 165 224 80 285 86 C345 92 345 138 410 126 C472 114 482 52 545 62 C606 72 627 106 690 78" fill="none" stroke="#13977f" strokeLinecap="round" strokeWidth="4" />
          <path d="M35 195 C88 150 111 142 155 152 C212 165 224 80 285 86 C345 92 345 138 410 126 C472 114 482 52 545 62 C606 72 627 106 690 78 L690 270 L35 270 Z" fill="url(#incomeFill)" />
          <path d="M35 222 C94 204 113 180 162 188 C225 198 232 142 294 150 C352 158 354 192 417 182 C482 172 493 118 552 132 C610 146 632 178 690 158" fill="none" stroke="#2d8ce9" strokeLinecap="round" strokeWidth="4" />
          <path d="M35 222 C94 204 113 180 162 188 C225 198 232 142 294 150 C352 158 354 192 417 182 C482 172 493 118 552 132 C610 146 632 178 690 158 L690 270 L35 270 Z" fill="url(#expenseFill)" />
          </svg>
        ) : (
          <EmptyState className="h-full" title="No data available" message="Income and expense trends require transaction history." />
        )}
      </div>
    </ReportCard>
  );
}
