import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/", label: "Home", icon: "🏠", end: true },
  { to: "/study", label: "Study", icon: "📖", end: false },
  { to: "/practice", label: "Practice", icon: "📝", end: false },
  { to: "/progress", label: "Progress", icon: "📊", end: false },
];

export default function App() {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col bg-slate-950 text-slate-100">
      <main className="flex-1 px-4 pb-24 pt-6">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-800 bg-slate-900/95 backdrop-blur">
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
