import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/", label: "Home", icon: "🏠", end: true },
  { to: "/study", label: "Study", icon: "📖", end: false },
  { to: "/practice", label: "Practice", icon: "📝", end: false },
  { to: "/progress", label: "Progress", icon: "📊", end: false },
];

export default function App() {
  return (
    <div className="min-h-full bg-paper text-ink">
      {/* Desktop / web top nav */}
      <header className="sticky top-0 z-10 hidden border-b border-rule bg-card md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-10 py-4">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="text-lg">📻</span>
            <span className="font-serif text-[19px] font-medium text-ink">Technician Study</span>
          </NavLink>
          <nav className="flex items-center gap-[26px] font-mono text-[11px] uppercase tracking-[0.12em]">
            {tabs
              .filter((t) => t.to !== "/")
              .map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-brick pb-[3px] font-semibold text-brick"
                      : "pb-[3px] text-muted transition-colors hover:text-ink"
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-28 pt-6 md:px-10 md:pb-12 md:pt-9">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-rule bg-card md:hidden">
        <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2 pb-[max(22px,env(safe-area-inset-bottom))] pt-2.5">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className="flex flex-1 flex-col items-center gap-[3px]"
            >
              {({ isActive }) => (
                <>
                  <span className={`text-[19px] leading-none ${isActive ? "" : "opacity-55"}`}>
                    {tab.icon}
                  </span>
                  <span
                    className={`font-mono text-[9.5px] ${
                      isActive ? "font-semibold text-brick" : "text-muted"
                    }`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
