import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/", label: "Home", icon: "🏠", end: true },
  { to: "/study", label: "Study", icon: "📖", end: false },
  { to: "/practice", label: "Practice", icon: "📝", end: false },
  { to: "/progress", label: "Progress", icon: "📊", end: false },
];

export default function App() {
  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      {/* Desktop / web top nav */}
      <header className="sticky top-0 z-10 hidden border-b border-slate-800 bg-slate-900/80 backdrop-blur md:block">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span>📻</span> Technician Study
          </NavLink>
          <nav className="flex items-center gap-1">
            {tabs
              .filter((t) => t.to !== "/")
              .map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-sky-500/15 text-sky-400"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-6 md:pb-12">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-800 bg-slate-900/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                  isActive ? "text-sky-400" : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
