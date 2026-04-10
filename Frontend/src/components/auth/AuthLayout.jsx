import AuthFooter from "./AuthFooter";

export default function AuthLayout({
  eyebrow = "SYM",
  heroTitle,
  heroDescription,
  cardTitle,
  cardSubtitle,
  children,
}) {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#c8f3e8] via-[#eef4ff] to-[#d9d8ff] px-16 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="text-4xl font-extrabold tracking-tight text-[#0aa37f]">
            {eyebrow}
          </div>

          <div className="max-w-md">
            <h1 className="text-6xl font-extrabold leading-[0.95] tracking-tight text-[#1d1d1f]">
              {heroTitle}
            </h1>
            <p className="mt-8 text-lg leading-8 text-[#4b5563]">
              {heroDescription}
            </p>
          </div>

          <AuthFooter align="left" />
        </aside>

        <main className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md rounded-[28px] bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#1f2937]">{cardTitle}</h2>
              {cardSubtitle ? (
                <div className="mt-2 text-sm text-[#6b7280]">{cardSubtitle}</div>
              ) : null}
            </div>

            {children}

            <div className="mt-8 lg:hidden">
              <AuthFooter align="center" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
