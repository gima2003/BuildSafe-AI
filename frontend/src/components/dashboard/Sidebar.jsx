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
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../common/ThemeToggle";

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
  isDark,
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? item.label : ""}
      className={`
        group relative flex w-full items-center
        rounded-xl px-3.5 py-2.5
        text-[15px] font-medium
        transition-all duration-200 cursor-pointer
        ${
          active
            ? isDark
              ? "bg-white/10 text-white font-semibold shadow-sm border border-white/10"
              : "bg-cyan-50/90 text-cyan-900 font-semibold shadow-xs border border-cyan-200/80"
            : isDark
              ? "text-slate-300 hover:bg-white/8 hover:text-white"
              : "text-[#5B6472] hover:bg-[#EEF0F3] hover:text-[#1F2937]"
        }
        ${collapsed ? "justify-center" : "gap-3.5"}
      `}
    >
      {active && (
        <span className="absolute left-0 h-6 w-1 rounded-r-full bg-cyan-500" />
      )}

      <Icon
        size={20}
        strokeWidth={active ? 2.2 : 1.9}
        className={`
          shrink-0 transition-transform duration-200
          ${active ? (isDark ? "text-cyan-400" : "text-cyan-600") : isDark ? "text-slate-400" : "text-[#5B6472]"}
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
  isDark,
}) {
  return (
    <div className="mb-6">
      {!collapsed && (
        <p
          className={`
            mb-2.5 px-3.5
            text-xs font-bold
            uppercase tracking-wider
            ${isDark ? "text-slate-400" : "text-[#5B6472]"}
          `}
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
            isDark={isDark}
            onClick={() => setActivePage(item.label)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({
  activePage: propActivePage,
  setActivePage: propSetActivePage,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [internalPage, setInternalPage] = useState("Predict Severity");
  const { isDark } = useTheme();

  const activePage = propActivePage || internalPage;
  const setActivePage = propSetActivePage || setInternalPage;

  return (
    <aside
      className={`
        relative flex h-screen shrink-0 flex-col
        border-r transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-70"}
        ${isDark ? "border-white/8 bg-[#0b1120] text-white" : "border-[#D9DEE5] bg-[#F8F9FA] text-[#1F2937] shadow-xs"}
      `}
    >
      {/* ================================================== */}
      {/* LOGO */}
      {/* ================================================== */}

      <div
        className={`
          flex h-20 items-center
          border-b
          ${collapsed ? "justify-center px-3" : "px-6"}
          ${isDark ? "border-white/8" : "border-[#D9DEE5]"}
        `}
      >
        <div className="flex items-center gap-3.5">
          {/* Logo */}
          <div
            className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-xl
              bg-linear-to-br
              from-cyan-500 to-blue-600
              shadow-lg shadow-cyan-500/15
            "
          >
            <Activity
              size={22}
              strokeWidth={2.4}
              className="text-white"
            />
          </div>

          {!collapsed && (
            <div className="leading-tight">
              <h1
                className={`
                  text-base
                  font-bold
                  tracking-tight
                  ${isDark ? "text-white" : "text-[#1F2937]"}
                `}
              >
                BuildSafe-AI
              </h1>

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-cyan-600 dark:text-cyan-400
                "
              >
                DOB Intelligence
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================================================== */}
      {/* NAVIGATION */}
      {/* ================================================== */}

      <nav className="flex-1 overflow-y-auto px-3.5 py-6">
        <NavigationSection
          title="Main"
          items={mainNavigation}
          activePage={activePage}
          setActivePage={setActivePage}
          collapsed={collapsed}
          isDark={isDark}
        />

        <NavigationSection
          title="Insights"
          items={insightNavigation}
          activePage={activePage}
          setActivePage={setActivePage}
          collapsed={collapsed}
          isDark={isDark}
        />

        <NavigationSection
          title="System"
          items={systemNavigation}
          activePage={activePage}
          setActivePage={setActivePage}
          collapsed={collapsed}
          isDark={isDark}
        />
      </nav>

      {/* ================================================== */}
      {/* MODEL STATUS */}
      {/* ================================================== */}

      {!collapsed && (
        <div className="px-3.5 pb-3">
          <div
            className={`
              rounded-2xl border p-4.5
              ${isDark ? "border-white/10 bg-[#111827]/70" : "border-[#D9DEE5] bg-white shadow-xs"}
            `}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Model Online
                </span>
              </div>
              <Activity size={15} className={isDark ? "text-slate-400" : "text-[#5B6472]"} />
            </div>

            <p className={`text-[15px] font-bold ${isDark ? "text-white" : "text-[#1F2937]"}`}>
              Logistic Regression [tuned]
            </p>

            <div className="mt-2.5 flex items-end justify-between">
              <span className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
                Macro-F1 (Test)
              </span>
              <span className="text-base font-black text-cyan-600 dark:text-cyan-400">
                77.11%
              </span>
            </div>

            <div className={`mt-2.5 h-1.5 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-[#EEF0F3]"}`}>
              <div className="h-full w-[77.11%] rounded-full bg-linear-to-r from-cyan-500 to-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* THEME TOGGLE & USER FOOTER */}
      {/* ================================================== */}

      <div
        className={`
          border-t p-3.5 space-y-2.5
          ${isDark ? "border-white/8" : "border-[#D9DEE5]"}
          ${collapsed ? "flex flex-col items-center" : ""}
        `}
      >
        {/* Theme changer button */}
        <div className={collapsed ? "flex justify-center" : "w-full"}>
          <ThemeToggle showLabel={!collapsed} className="w-full justify-center" />
        </div>

        {/* User Card */}
        <div
          className={`
            flex items-center rounded-xl p-2.5 border
            ${isDark ? "bg-white/5 border-white/8" : "bg-[#EEF0F3] border-[#D9DEE5]"}
            ${collapsed ? "justify-center" : "gap-3"}
          `}
        >
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-lg
              bg-linear-to-br
              from-slate-700 to-slate-900
              text-xs font-bold text-white shadow-xs
            "
          >
            BS
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className={`truncate text-sm font-bold ${isDark ? "text-white" : "text-[#1F2937]"}`}>
                BuildSafe Inspector
              </p>
              <p className={`truncate text-xs font-medium ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
                NYC DOB Enforcement
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
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`
          absolute -right-3.5 top-18 flex h-7 w-7 items-center justify-center
          rounded-full border shadow-md transition-all duration-200 hover:scale-110 cursor-pointer
          ${isDark ? "border-white/12 bg-[#111827] text-slate-300 hover:text-white" : "border-[#D9DEE5] bg-white text-[#1F2937] hover:bg-[#EEF0F3]"}
        `}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}