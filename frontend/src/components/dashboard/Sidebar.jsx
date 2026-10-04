import { useState } from "react";
import {
  LayoutDashboard,
  BrainCircuit,
  Upload,
  Search,
  BarChart3,
  Cpu,
  AlertTriangle,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";

const mainNavigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Predict Severity",
    icon: BrainCircuit,
  },
  {
    label: "Batch Prediction",
    icon: Upload,
  },
  {
    label: "Case Explorer",
    icon: Search,
  },
];

const insightNavigation = [
  {
    label: "Analytics",
    icon: BarChart3,
  },
  {
    label: "Model Intelligence",
    icon: Cpu,
  },
  {
    label: "Error Analysis",
    icon: AlertTriangle,
  },
];

const systemNavigation = [
  {
    label: "Data Quality",
    icon: Database,
  },
  {
    label: "Settings",
    icon: Settings,
  },
];

function NavigationItem({
  item,
  active,
  collapsed,
  onClick,
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? item.label : ""}
      className={`
        group relative flex w-full items-center
        rounded-xl px-3 py-2.5
        text-sm font-medium
        transition-all duration-200
        ${
          active
            ? "bg-white/10 text-white shadow-sm"
            : "text-slate-400 hover:bg-white/6 hover:text-white"
        }
        ${collapsed ? "justify-center" : "gap-3"}
      `}
    >
      {active && (
        <span className="absolute left-0 h-6 w-1 rounded-r-full bg-cyan-400" />
      )}

      <Icon
        size={19}
        strokeWidth={active ? 2.2 : 1.8}
        className={`
          shrink-0 transition-transform duration-200
          ${active ? "text-cyan-400" : "text-slate-500"}
          group-hover:scale-105
        `}
      />

      {!collapsed && (
        <span className="truncate">
          {item.label}
        </span>
      )}
    </button>
  );
}

function NavigationSection({
  title,
  items,
  activePage,
  setActivePage,
  collapsed,
}) {
  return (
    <div className="mb-6">
      {!collapsed && (
        <p
          className="
            mb-2 px-3
            text-[10px] font-semibold
            uppercase tracking-[0.18em]
            text-slate-600
          "
        >
          {title}
        </p>
      )}

      <div className="space-y-1">
        {items.map((item) => (
          <NavigationItem
            key={item.label}
            item={item}
            active={activePage === item.label}
            collapsed={collapsed}
            onClick={() => setActivePage(item.label)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] =
    useState("Dashboard");

  return (
    <aside
      className={`
        relative flex h-screen shrink-0 flex-col
        border-r border-white/6
        bg-[#0b1120]
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-19" : "w-65"}
      `}
    >
      {/* ================================================== */}
      {/* LOGO */}
      {/* ================================================== */}

      <div
        className={`
          flex h-20.5 items-center
          border-b border-white/6
          ${collapsed ? "justify-center px-3" : "px-5"}
        `}
      >
        <div className="flex items-center gap-3">

          {/* Logo */}
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              bg-linear-to-br
              from-cyan-400 to-blue-600
              shadow-lg shadow-cyan-500/10
            "
          >
            <Activity
              size={21}
              strokeWidth={2.4}
              className="text-white"
            />
          </div>

          {!collapsed && (
            <div className="leading-tight">
              <h1
                className="
                  text-[15px]
                  font-bold
                  tracking-wide
                  text-white
                "
              >
                BuildSafe
              </h1>

              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.2em]
                  text-cyan-400
                "
              >
                AI Intelligence
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================================================== */}
      {/* NAVIGATION */}
      {/* ================================================== */}

      <nav className="flex-1 overflow-y-auto px-3 py-6">

        <NavigationSection
          title="Main"
          items={mainNavigation}
          activePage={activePage}
          setActivePage={setActivePage}
          collapsed={collapsed}
        />

        <NavigationSection
          title="Insights"
          items={insightNavigation}
          activePage={activePage}
          setActivePage={setActivePage}
          collapsed={collapsed}
        />

        <NavigationSection
          title="System"
          items={systemNavigation}
          activePage={activePage}
          setActivePage={setActivePage}
          collapsed={collapsed}
        />

      </nav>

      {/* ================================================== */}
      {/* MODEL STATUS */}
      {/* ================================================== */}

      {!collapsed && (
        <div className="px-3 pb-4">

          <div
            className="
              rounded-2xl
              border border-white/[0.07]
              bg-white/[0.035]
              p-4
            "
          >

            <div
              className="
                mb-3
                flex
                items-center
                justify-between
              "
            >

              <div className="flex items-center gap-2">

                {/* Online indicator */}
                <span className="relative flex h-2 w-2">

                  <span
                    className="
                      absolute
                      inline-flex
                      h-full w-full
                      animate-ping
                      rounded-full
                      bg-emerald-400
                      opacity-60
                    "
                  />

                  <span
                    className="
                      relative
                      inline-flex
                      h-2 w-2
                      rounded-full
                      bg-emerald-400
                    "
                  />

                </span>

                <span
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-emerald-400
                  "
                >
                  Model Online
                </span>

              </div>

              <Activity
                size={14}
                className="text-slate-600"
              />

            </div>

            <p
              className="
                text-sm
                font-semibold
                text-white
              "
            >
              Linear SVM
            </p>

            <div
              className="
                mt-2
                flex
                items-end
                justify-between
              "
            >

              <span className="text-xs text-slate-500">
                Accuracy
              </span>

              <span
                className="
                  text-sm
                  font-bold
                  text-cyan-400
                "
              >
                99.39%
              </span>

            </div>

            {/* Accuracy bar */}
            <div
              className="
                mt-2
                h-1
                overflow-hidden
                rounded-full
                bg-white/6
              "
            >
              <div
                className="
                  h-full
                  w-[99.39%]
                  rounded-full
                  bg-linear-to-r
                  from-cyan-500
                  to-blue-500
                "
              />
            </div>

          </div>

        </div>
      )}

      {/* ================================================== */}
      {/* USER */}
      {/* ================================================== */}

      <div
        className={`
          border-t border-white/6
          p-3
          ${collapsed ? "flex justify-center" : ""}
        `}
      >

        <div
          className={`
            flex
            items-center
            rounded-xl
            bg-white/2.5
            p-2
            ${collapsed ? "justify-center" : "gap-3"}
          `}
        >

          <div
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-lg
              bg-linear-to-br
              from-slate-600
              to-slate-800
              text-xs
              font-bold
              text-white
            "
          >
            BS
          </div>

          {!collapsed && (
            <div className="min-w-0">

              <p
                className="
                  truncate
                  text-xs
                  font-semibold
                  text-white
                "
              >
                BuildSafe Admin
              </p>

              <p
                className="
                  truncate
                  text-[10px]
                  text-slate-500
                "
              >
                AI Analytics
              </p>

            </div>
          )}

        </div>

      </div>

      {/* ================================================== */}
      {/* COLLAPSE BUTTON */}
      {/* ================================================== */}

      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={
          collapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
        className="
          absolute
          -right-3
          top-18
          flex
          h-6 w-6
          items-center
          justify-center
          rounded-full
          border border-white/10
          bg-[#111827]
          text-slate-400
          shadow-lg
          transition-all
          duration-200
          hover:scale-110
          hover:text-white
        "
      >
        {collapsed ? (
          <ChevronRight size={13} />
        ) : (
          <ChevronLeft size={13} />
        )}
      </button>

    </aside>
  );
}