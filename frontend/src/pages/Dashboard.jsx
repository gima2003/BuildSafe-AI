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
    <div className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 shadow-2xl">
      <p className="mb-2 text-xs font-semibold text-white">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-xs text-slate-400">
          {item.name}:{" "}
          <span className="font-semibold text-white">
            {typeof item.value === "number" ? `${item.value}%` : item.value}
          </span>
        </p>
      ))}
    </div>
  );
}

/* Stat Card */
function StatCard({ label, value, description, icon: Icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-white/6 bg-[#111827]/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/12 hover:shadow-xl hover:shadow-black/20 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400 opacity-[0.06] blur-3xl transition-opacity duration-300 group-hover:opacity-[0.12]" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/6 bg-white/4">
            <Icon size={19} className="text-cyan-400" />
          </div>
        </div>
        <p className="mt-4 text-[11px] text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activePage, setActivePage] = useState("Predict Severity");

  return (
    <div className="flex h-screen overflow-hidden bg-[#080d18] text-white">
      {/* Sidebar with active page navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 overflow-y-auto">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/6 bg-[#080d18]/90 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            {/* Quick Navigation Tabs in Header */}
            <div className="flex items-center gap-1 rounded-xl border border-white/6 bg-white/3 p-1">
              <button
                type="button"
                onClick={() => setActivePage("Predict Severity")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activePage === "Predict Severity"
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BrainCircuit size={14} />
                Predict Severity
              </button>
              <button
                type="button"
                onClick={() => setActivePage("Batch Prediction")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activePage === "Batch Prediction"
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Upload size={14} />
                Batch Triage
              </button>
              <button
                type="button"
                onClick={() => setActivePage("Dashboard")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activePage === "Dashboard"
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Activity size={14} />
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActivePage("Model Intelligence")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activePage === "Model Intelligence"
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BarChart3 size={14} />
                Model Audit
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/3 px-3 py-1.5 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
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
            <section className="relative overflow-hidden rounded-3xl border border-white/6 bg-linear-to-r from-[#0d1527] via-[#0f1b33] to-[#0a1224] p-8 shadow-2xl">
              <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                      IT3051 Fundamentals of Data Mining · Mini Project 2026
                    </span>
                  </div>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                    BuildSafe-AI · NYC DOB Violation Triage
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                    Automated, leakage-masked machine learning pipeline for classifying NYC Department of Buildings / ECB violation hazard severity into Class 1 (Immediately Hazardous), Class 2 (Major), or Class 3 (Lesser) with human inspector safety dispatch.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePage("Predict Severity")}
                    className="flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 cursor-pointer transition-all"
                  >
                    <BrainCircuit size={16} />
                    Predict Single Violation
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePage("Batch Prediction")}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer transition-all"
                  >
                    <Upload size={16} />
                    Batch CSV Triage
                  </button>
                </div>
              </div>
            </section>

            {/* KPI STAT CARDS */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Training Dataset"
                value="81,780"
                description="Time-split chronological observations"
                icon={Database}
              />
              <StatCard
                label="Class 1 Recall (Hazardous)"
                value="86.11%"
                description="Passes safety guard-rail (≥ 80.0%)"
                icon={ShieldCheck}
              />
              <StatCard
                label="Selected Model Macro-F1"
                value="77.11%"
                description="Logistic Regression [tuned] on test set"
                icon={Activity}
              />
              <StatCard
                label="Human Inspection Cutoff"
                value="< 65.0%"
                description="Validation-calibrated review threshold"
                icon={AlertTriangle}
              />
            </section>

            {/* CHARTS */}
            <section className="grid gap-6 xl:grid-cols-3">
              {/* Severity Distribution */}
              <div className="rounded-2xl border border-white/6 bg-[#111827]/60 p-6">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-white">Target Class Distribution</p>
                  <p className="mt-1 text-xs text-slate-500">Imbalance profile of NYC building violations</p>
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
                      <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2">
                  {severityData.map((item) => (
                    <div key={item.name} className="rounded-xl bg-white/2.5 p-2.5 text-center">
                      <p className="text-[10px] text-slate-500 truncate">{item.name}</p>
                      <p className="mt-1 text-sm font-bold text-white">{item.percentage}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Performance Comparison */}
              <div className="rounded-2xl border border-white/6 bg-[#111827]/60 p-6 xl:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Candidate Model Comparison (Stage 7 CV)</p>
                    <p className="mt-1 text-xs text-slate-500">Cross-validation Macro-F1 across 5 evaluated algorithms</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePage("Model Intelligence")}
                    className="text-xs text-cyan-400 hover:underline font-medium"
                  >
                    View Selection Audit →
                  </button>
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelData} margin={{ top: 10, right: 10, left: 0, bottom: 45 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="name"
                        angle={-20}
                        textAnchor="end"
                        tick={{ fill: "#64748b", fontSize: 10 }}
                      />
                      <YAxis
                        domain={[70, 85]}
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="macroF1" name="CV Macro-F1" fill="#22d3ee" radius={[5, 5, 0, 0]}>
                        {modelData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.name.includes("Logistic") ? "#38bdf8" : "#64748b"}
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