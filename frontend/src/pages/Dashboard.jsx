import { useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Search,
  Database,
  ShieldCheck,
  AlertTriangle,
  Activity,
  BrainCircuit,
  Upload,
  BarChart3,
  Trophy,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

import Sidebar from "../components/dashboard/Sidebar";
import ErrorIntelligence from "../components/dashboard/ErrorIntelligence";
import PredictSeverity from "./PredictSeverity";
import BatchPrediction from "./BatchPrediction";
import ModelIntelligence from "./ModelIntelligence";
import ThemeToggle from "../components/common/ThemeToggle";
import { useTheme } from "../context/ThemeContext";

/* =========================================================
   VERIFIED PROJECT DATA (Notebook 02, 06, 07)
   ========================================================= */

const severityData = [
  {
    name: "Class 1 (Hazardous)",
    value: 32213,
    percentage: 39.33,
  },
  {
    name: "Class 2 (Major)",
    value: 46320,
    percentage: 56.55,
  },
  {
    name: "Class 3 (Lesser)",
    value: 3370,
    percentage: 4.11,
  },
];

/* 5 candidate models evaluated in Stage 7 with CV Macro-F1 and C1 Recall */
const modelData = [
  {
    name: "Linear SVM [tuned]",
    macroF1: 77.68,
    c1Recall: 83.16,
    eligible: "Disqualified (No Probs)",
  },
  {
    name: "LightGBM [tuned]",
    macroF1: 77.48,
    c1Recall: 84.22,
    eligible: "Passed",
  },
  {
    name: "Random Forest [tuned]",
    macroF1: 77.27,
    c1Recall: 82.31,
    eligible: "Passed",
  },
  {
    name: "Logistic Reg [tuned]",
    macroF1: 77.19,
    c1Recall: 84.08,
    eligible: "Selected Winner",
  },
  {
    name: "XGBoost [tuned]",
    macroF1: 76.54,
    c1Recall: 84.95,
    eligible: "Passed",
  },
];

/* Custom Tooltip */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-[#D9DEE5] dark:border-white/10 bg-white dark:bg-[#111827] px-4 py-3 shadow-xl text-[#1F2937] dark:text-white">
      <p className="mb-2 text-sm font-bold">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-xs font-medium text-[#5B6472] dark:text-slate-400">
          {item.name}:{" "}
          <span className="font-bold text-[#1F2937] dark:text-white">
            {typeof item.value === "number" ? `${item.value}%` : item.value}
          </span>
        </p>
      ))}
    </div>
  );
}

/* Stat Card */
function StatCard({ label, value, description, icon: Icon, onClick, isDark }) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        isDark
          ? "border-white/8 bg-[#111827]/80 text-white hover:border-white/16 hover:shadow-black/25"
          : "border-[#D9DEE5] bg-white text-[#1F2937] shadow-xs hover:border-slate-300 hover:shadow-md"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400 opacity-[0.06] blur-3xl transition-opacity duration-300 group-hover:opacity-[0.14]" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm font-semibold ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>{label}</p>
            <h3 className={`mt-2 text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#1F2937]"}`}>{value}</h3>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
            isDark ? "border-white/8 bg-white/5" : "border-[#D9DEE5] bg-[#EEF0F3]"
          }`}>
            <Icon size={20} className="text-cyan-600 dark:text-cyan-400" />
          </div>
        </div>
        <p className={`mt-3 text-sm font-medium ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>{description}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activePage, setActivePage] = useState("Predict Severity");
  const { isDark } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? "bg-[#080d18] text-white" : "bg-[#F5F6F8] text-[#1F2937]"}`}>
      {/* Sidebar with active page navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 overflow-y-auto">
        {/* Sticky Top Header */}
        <header className={`sticky top-0 z-20 flex h-20 items-center justify-between border-b px-8 backdrop-blur-xl ${
          isDark ? "border-white/8 bg-[#080d18]/90" : "border-[#D9DEE5] bg-white/95 shadow-xs"
        }`}>
          <div className="flex items-center gap-4">
            {/* Quick Navigation Tabs in Header */}
            <div className={`flex items-center gap-1.5 rounded-xl border p-1 ${
              isDark ? "border-white/8 bg-white/4" : "border-[#D9DEE5] bg-[#EEF0F3]"
            }`}>
              {[
                { id: "Predict Severity", label: "Predict Severity", icon: BrainCircuit },
                { id: "Batch Prediction", label: "Batch Triage", icon: Upload },
                { id: "Dashboard", label: "Overview", icon: Activity },
                { id: "Model Intelligence", label: "Model Audit", icon: BarChart3 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activePage === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePage(tab.id)}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-cyan-600 text-white font-bold shadow-xs"
                        : isDark
                          ? "text-slate-300 hover:text-white hover:bg-white/8"
                          : "text-[#5B6472] hover:text-[#1F2937] hover:bg-white"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Theme Toggle Button in Header */}
            <ThemeToggle />

            {/* FastAPI Backend Status Badge */}
            <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold ${
              isDark ? "border-white/8 bg-white/4 text-slate-200" : "border-[#D9DEE5] bg-white text-[#1F2937] shadow-xs"
            }`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>FastAPI Backend Active (:8000)</span>
            </div>
          </div>
        </header>

        {/* View Router */}
        {activePage === "Predict Severity" && <PredictSeverity />}
        {activePage === "Batch Prediction" && <BatchPrediction />}
        {activePage === "Model Intelligence" && <ModelIntelligence />}
        {activePage === "Error Analysis" && (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <ErrorIntelligence />
          </div>
        )}

        {/* Overview Dashboard View */}
        {(activePage === "Dashboard" || activePage === "Analytics" || activePage === "Case Explorer" || activePage === "Data Quality" || activePage === "Settings") && (
          <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* HERO BANNER */}
            <section className={`relative overflow-hidden rounded-3xl border p-8 md:p-10 shadow-xl ${
              isDark
                ? "border-white/8 bg-linear-to-r from-[#0d1527] via-[#0f1b33] to-[#0a1224]"
                : "border-[#D9DEE5] bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md"
            }`}>
              <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      IT3051 Fundamentals of Data Mining · Mini Project 2026
                    </span>
                  </div>
                  <h2 className="mt-2.5 text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                    BuildSafe-AI · NYC DOB Violation Triage
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-200">
                    Automated, leakage-masked machine learning pipeline for classifying NYC Department of Buildings / ECB violation hazard severity into Class 1 (Immediately Hazardous), Class 2 (Major), or Class 3 (Lesser) with human inspector safety dispatch.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3.5">
                  <button
                    type="button"
                    onClick={() => setActivePage("Predict Severity")}
                    className="flex items-center gap-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 cursor-pointer transition-all"
                  >
                    <BrainCircuit size={18} />
                    Predict Single Violation
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePage("Batch Prediction")}
                    className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 cursor-pointer transition-all"
                  >
                    <Upload size={18} />
                    Batch CSV Triage
                  </button>
                </div>
              </div>
            </section>

            {/* KPI STAT CARDS */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Training Dataset"
                value="81,780"
                description="Time-split chronological observations"
                icon={Database}
                isDark={isDark}
              />
              <StatCard
                label="Class 1 Recall (Hazardous)"
                value="86.11%"
                description="Passes safety guard-rail (≥ 80.0%)"
                icon={ShieldCheck}
                isDark={isDark}
              />
              <StatCard
                label="Selected Model Macro-F1"
                value="77.11%"
                description="Logistic Regression [tuned] on test set"
                icon={Activity}
                isDark={isDark}
              />
              <StatCard
                label="Human Inspection Cutoff"
                value="< 65.0%"
                description="Validation-calibrated review threshold"
                icon={AlertTriangle}
                isDark={isDark}
              />
            </section>

            {/* CHARTS */}
            <section className="grid gap-6 xl:grid-cols-3">
              {/* Severity Distribution */}
              <div className={`rounded-2xl border p-6.5 ${
                isDark ? "border-white/8 bg-[#111827]/70" : "border-[#D9DEE5] bg-white shadow-xs"
              }`}>
                <div className="mb-4">
                  <p className={`text-base font-bold ${isDark ? "text-white" : "text-[#1F2937]"}`}>Target Class Distribution</p>
                  <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>Imbalance profile of NYC building violations</p>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        <Cell fill="#ef4444" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#5b6472" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2.5">
                  {severityData.map((item) => (
                    <div key={item.name} className={`rounded-xl p-3 text-center border ${
                      isDark ? "bg-white/4 border-white/8" : "bg-[#EEF0F3] border-[#D9DEE5]"
                    }`}>
                      <p className={`text-xs font-semibold truncate ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>{item.name}</p>
                      <p className={`mt-1 text-base font-black ${isDark ? "text-white" : "text-[#1F2937]"}`}>{item.percentage}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Performance Comparison */}
              <div className={`rounded-2xl border p-6.5 xl:col-span-2 ${
                isDark ? "border-white/8 bg-[#111827]/70" : "border-[#D9DEE5] bg-white shadow-xs"
              }`}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className={`text-base font-bold ${isDark ? "text-white" : "text-[#1F2937]"}`}>Candidate Model Comparison (Stage 7 CV)</p>
                    <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>Cross-validation Macro-F1 across 5 evaluated algorithms</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePage("Model Intelligence")}
                    className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    View Selection Audit →
                  </button>
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelData} margin={{ top: 10, right: 10, left: 0, bottom: 45 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} />
                      <XAxis
                        dataKey="name"
                        angle={-20}
                        textAnchor="end"
                        tick={{ fill: isDark ? "#94a3b8" : "#5b6472", fontSize: 12 }}
                      />
                      <YAxis
                        domain={[70, 85]}
                        tick={{ fill: isDark ? "#94a3b8" : "#5b6472", fontSize: 12 }}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="macroF1" name="CV Macro-F1" fill="#22d3ee" radius={[5, 5, 0, 0]}>
                        {modelData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.name.includes("Logistic") ? "#0284c7" : isDark ? "#475569" : "#94a3b8"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* Error Intelligence Section */}
            <ErrorIntelligence />
          </div>
        )}
      </main>
    </div>
  );
}