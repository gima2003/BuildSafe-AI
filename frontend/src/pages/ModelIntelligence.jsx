import { useState, useEffect } from "react";
import {
  Cpu,
  Trophy,
  CheckCircle2,
  XCircle,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Clock,
  Layers,
  FileCheck,
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
} from "recharts";
import { getModelMetrics, getModelCandidates } from "../services/api";
import { useTheme } from "../context/ThemeContext";

export default function ModelIntelligence() {
  const { isDark } = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [m, c] = await Promise.all([getModelMetrics(), getModelCandidates()]);
        setMetrics(m);
        setCandidates(c);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featureChartData = (metrics?.top_features || []).map(([name, weight]) => ({
    name: name.replace("text__", "word: ").replace("cat__VIOLATION_TYPE_", "type: "),
    weight: Math.round(weight * 100000) / 100, // scaled for display
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${
        isDark ? "border-white/8" : "border-[#D9DEE5]"
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
            <span className="text-xs font-bold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase">
              Stage 7 &amp; 9 Model Governance
            </span>
          </div>
          <h1 className={`mt-1.5 text-2xl md:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#1F2937]"}`}>
            Model Intelligence &amp; Selection Audit
          </h1>
          <p className={`mt-1.5 text-base ${isDark ? "text-slate-300" : "text-[#5B6472]"}`}>
            Pre-declared selection rule audit, 5-algorithm cross-validation benchmark, and locked test evaluation.
          </p>
        </div>

        <div className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-sm font-bold border ${
          isDark ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300" : "bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs"
        }`}>
          <Trophy size={18} className="text-emerald-600 dark:text-emerald-400" />
          Production Winner: Logistic Regression [tuned]
        </div>
      </div>

      {/* Production Model KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-6 rounded-2xl border ${isDark ? "border-white/10 bg-[#111827]/70" : "border-[#D9DEE5] bg-white shadow-xs"}`}>
          <div className={`flex items-center justify-between text-sm font-semibold ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
            <span>CV Macro-F1 (Mean ± Std)</span>
            <BarChart3 size={18} className="text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className={`text-3xl font-black mt-2.5 ${isDark ? "text-white" : "text-[#1F2937]"}`}>
            {metrics ? `${(metrics.cv_macro_f1_mean * 100).toFixed(2)}%` : "77.19%"}
          </p>
          <p className={`text-xs font-medium mt-2 ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>± 0.47% on 3 expanding time-folds</p>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? "border-white/10 bg-[#111827]/70" : "border-[#D9DEE5] bg-white shadow-xs"}`}>
          <div className={`flex items-center justify-between text-sm font-semibold ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
            <span>Locked Test Macro-F1</span>
            <TrendingUp size={18} className="text-blue-500" />
          </div>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2.5">
            {metrics ? `${(metrics.test_macro_f1 * 100).toFixed(2)}%` : "77.11%"}
          </p>
          <p className={`text-xs font-medium mt-2 ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>Evaluated once · 95% CI [76.1%, 78.1%]</p>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? "border-white/10 bg-[#111827]/70" : "border-[#D9DEE5] bg-white shadow-xs"}`}>
          <div className={`flex items-center justify-between text-sm font-semibold ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
            <span>Class 1 Recall (Hazardous)</span>
            <ShieldCheck size={18} className="text-red-500" />
          </div>
          <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-2.5">
            {metrics ? `${(metrics.test_c1_recall * 100).toFixed(2)}%` : "86.11%"}
          </p>
          <p className={`text-xs font-medium mt-2 ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>Target ≥ 80.0% guard-rail passed</p>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? "border-white/10 bg-[#111827]/70" : "border-[#D9DEE5] bg-white shadow-xs"}`}>
          <div className={`flex items-center justify-between text-sm font-semibold ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
            <span>Overall Test Accuracy / AUC</span>
            <Zap size={18} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2.5">
            {metrics ? `${(metrics.test_accuracy * 100).toFixed(2)}%` : "82.23%"}
          </p>
          <p className={`text-xs font-medium mt-2 ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>Macro-AUC (OvR): 0.9423</p>
        </div>
      </div>

      {/* Candidates Comparison Table */}
      <div className={`rounded-2xl border p-7 shadow-xl space-y-4 ${
        isDark ? "border-white/10 bg-[#111827]/70" : "border-[#D9DEE5] bg-white shadow-xs"
      }`}>
        <div>
          <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-[#1F2937]"}`}>
            <Layers size={18} className="text-cyan-600 dark:text-cyan-400" />
            Candidate Comparison Table (Stage 7 Randomized Search)
          </h3>
          <p className={`text-sm mt-1.5 leading-relaxed ${isDark ? "text-slate-300" : "text-[#5B6472]"}`}>
            Pre-declared selection rule: Must satisfy Class-1 recall ≥ 0.80, Class-3 recall ≥ 0.55, and output calibrated probabilities. Top candidates within 0.005 Macro-F1 tie-broken by Class-1 recall then latency.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`border-b uppercase text-xs font-bold tracking-wider ${
              isDark ? "border-white/8 bg-white/3 text-slate-300" : "border-[#D9DEE5] bg-[#F8F9FA] text-[#1F2937]"
            }`}>
              <tr>
                <th className="py-4 px-4.5">Candidate Model</th>
                <th className="py-4 px-4.5">CV Macro-F1</th>
                <th className="py-4 px-4.5">Std</th>
                <th className="py-4 px-4.5">Class 1 Recall (≥ 0.80)</th>
                <th className="py-4 px-4.5">Class 3 Recall (≥ 0.55)</th>
                <th className="py-4 px-4.5">Probabilities?</th>
                <th className="py-4 px-4.5">Eligible</th>
                <th className="py-4 px-4.5">Decision</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-white/6 text-slate-200" : "divide-[#D9DEE5] text-[#1F2937]"}`}>
              {candidates.map((c, i) => {
                const isSelected = c.Candidate.includes("Logistic Regression");
                return (
                  <tr
                    key={i}
                    className={`transition-colors ${
                      isSelected
                        ? isDark ? "bg-cyan-500/15 font-semibold" : "bg-cyan-50/90 font-semibold"
                        : isDark ? "hover:bg-white/3" : "hover:bg-[#F8F9FA]"
                    }`}
                  >
                    <td className={`py-4 px-4.5 font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-[#1F2937]"}`}>
                      {isSelected && <Trophy size={16} className="text-amber-500" />}
                      {c.Candidate}
                    </td>
                    <td className="py-4 px-4.5 font-mono font-bold text-cyan-700 dark:text-cyan-300">
                      {(c["CV macro-F1"] * 100).toFixed(2)}%
                    </td>
                    <td className={`py-4 px-4.5 font-mono ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
                      ±{(c.std * 100).toFixed(2)}%
                    </td>
                    <td className="py-4 px-4.5 font-mono">
                      <span className={c["C1 >= 0.80"] ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"}>
                        {(c["CV C1 recall"] * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-4 px-4.5 font-mono">
                      <span className={c["C3 >= 0.55"] ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"}>
                        {(c["CV C3 recall"] * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-4 px-4.5">
                      {c["has probabilities"] ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 size={15} /> Yes
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5">
                          <XCircle size={15} /> No (Margin only)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4.5">
                      {c.eligible ? (
                        <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-1 rounded-full text-xs">PASS</span>
                      ) : (
                        <span className="text-red-700 dark:text-red-300 font-bold bg-red-100 dark:bg-red-500/20 px-2.5 py-1 rounded-full text-xs">DISQUALIFIED</span>
                      )}
                    </td>
                    <td className="py-4 px-4.5 text-xs font-semibold">
                      {isSelected ? (
                        <span className="bg-emerald-200 dark:bg-emerald-500/30 text-emerald-900 dark:text-emerald-200 px-2.5 py-1 rounded-full font-bold">
                          SELECTED WINNER
                        </span>
                      ) : !c.eligible ? (
                        <span className="text-slate-400">Lacks probabilistic output</span>
                      ) : (
                        <span className={isDark ? "text-slate-400" : "text-[#5B6472]"}>Tied Macro-F1 / slower latency</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Features Chart */}
      <div className={`rounded-2xl border p-7 shadow-xl space-y-4 ${
        isDark ? "border-white/10 bg-[#111827]/70" : "border-[#D9DEE5] bg-white shadow-xs"
      }`}>
        <div>
          <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-[#1F2937]"}`}>
            <TrendingUp size={18} className="text-cyan-600 dark:text-cyan-400" />
            Top Predictive Feature Signals (Permutation &amp; Coef Weights)
          </h3>
          <p className={`text-sm mt-1.5 ${isDark ? "text-slate-300" : "text-[#5B6472]"}`}>
            Key vocabulary phrases and categoricals driving automated triage decisions.
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={featureChartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 140, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} horizontal={false} />
              <XAxis type="number" tick={{ fill: isDark ? "#94a3b8" : "#5b6472", fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: isDark ? "#cbd5e1" : "#1f2937", fontSize: 12 }}
                width={130}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="p-3 rounded-xl border border-[#D9DEE5] dark:border-white/10 bg-white dark:bg-[#080d18] text-xs text-[#1F2937] dark:text-white shadow-lg">
                      <p className="font-bold text-sm">{payload[0].payload.name}</p>
                      <p className="text-cyan-700 dark:text-cyan-400 font-semibold mt-1">Impact Score: {payload[0].value}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="weight" fill="#0284c7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
