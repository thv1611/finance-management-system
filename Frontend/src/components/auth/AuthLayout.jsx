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
    <div className="min-h-screen">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.82),_transparent_28%),linear-gradient(145deg,_#d9f5ee_0%,_#eef4ff_46%,_#d9ddff_100%)] px-16 py-14 lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-80px] top-[-120px] h-64 w-64 rounded-full bg-white/40 blur-3xl" />
            <div className="absolute bottom-[-120px] right-[-60px] h-72 w-72 rounded-full bg-[#b7c7ff]/35 blur-3xl" />
          </div>

          <div className="relative z-10 text-[42px] font-extrabold tracking-[-0.08em] text-[#0aa37f]">
            {eyebrow}
          </div>

          <div className="relative z-10 max-w-md">
            <h1 className="text-6xl font-extrabold leading-[0.92] tracking-[-0.06em] text-[#17212a]">
              {heroTitle}
            </h1>
            <p className="mt-8 max-w-[30rem] text-lg font-medium leading-8 text-[#4d5c68]">
              {heroDescription}
            </p>
          </div>

          <div className="relative z-10">
            <AuthFooter align="left" />
          </div>
        </aside>

        <main className="relative flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_42%)]" />
          <div className="relative w-full max-w-md rounded-[32px] border border-white/70 bg-white/84 p-8 shadow-[0_28px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl">
            <div className="mb-8">
              <h2 className="text-[2rem] font-extrabold tracking-[-0.04em] text-[#1b2630]">{cardTitle}</h2>
              {cardSubtitle ? (
                <div className="mt-2 text-sm font-medium text-[#6b7280]">{cardSubtitle}</div>
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
