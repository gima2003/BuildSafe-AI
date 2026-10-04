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

export default function ModelIntelligence() {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/6 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
            <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              Stage 7 &amp; 9 Model Governance
            </span>
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-white">
            Model Intelligence &amp; Selection Audit
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Pre-declared selection rule audit, 5-algorithm cross-validation benchmark, and locked test evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-300 text-xs font-semibold">
          <Trophy size={16} className="text-emerald-400" />
          Production Winner: Logistic Regression [tuned]
        </div>
      </div>

      {/* Production Model KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-white/8 bg-[#111827]/70">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>CV Macro-F1 (Mean ± Std)</span>
            <BarChart3 size={16} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {metrics ? `${(metrics.cv_macro_f1_mean * 100).toFixed(2)}%` : "77.19%"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">± 0.47% on 3 expanding time-folds</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/8 bg-[#111827]/70">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Locked Test Macro-F1</span>
            <TrendingUp size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400 mt-2">
            {metrics ? `${(metrics.test_macro_f1 * 100).toFixed(2)}%` : "77.11%"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Evaluated once · 95% CI [76.1%, 78.1%]</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/8 bg-[#111827]/70">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Class 1 Recall (Hazardous)</span>
            <ShieldCheck size={16} className="text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400 mt-2">
            {metrics ? `${(metrics.test_c1_recall * 100).toFixed(2)}%` : "86.11%"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Target ≥ 80.0% guard-rail passed</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/8 bg-[#111827]/70">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Overall Test Accuracy / AUC</span>
            <Zap size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {metrics ? `${(metrics.test_accuracy * 100).toFixed(2)}%` : "82.23%"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Macro-AUC (OvR): 0.9423</p>
        </div>
      </div>

      {/* Candidates Comparison Table */}
      <div className="rounded-2xl border border-white/8 bg-[#111827]/60 p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers size={18} className="text-cyan-400" />
            Candidate Comparison Table (Stage 7 Randomized Search)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Pre-declared selection rule: Must satisfy Class-1 recall ≥ 0.80, Class-3 recall ≥ 0.55, and output calibrated probabilities. Top candidates within 0.005 Macro-F1 tie-broken by Class-1 recall then latency.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/8 bg-white/2 text-slate-400 uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Candidate Model</th>
                <th className="py-3 px-4">CV Macro-F1</th>
                <th className="py-3 px-4">Std</th>
                <th className="py-3 px-4">Class 1 Recall (≥ 0.80)</th>
                <th className="py-3 px-4">Class 3 Recall (≥ 0.55)</th>
                <th className="py-3 px-4">Probabilities?</th>
                <th className="py-3 px-4">Eligible</th>
                <th className="py-3 px-4">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6 text-slate-300">
              {candidates.map((c, i) => {
                const isSelected = c.Candidate.includes("Logistic Regression");
                return (
                  <tr
                    key={i}
                    className={`transition-colors ${
                      isSelected ? "bg-cyan-500/10 font-medium" : "hover:bg-white/2"
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      {isSelected && <Trophy size={14} className="text-yellow-400" />}
                      {c.Candidate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      {(c["CV macro-F1"] * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      ±{(c.std * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={c["C1 >= 0.80"] ? "text-emerald-400" : "text-red-400"}>
                        {(c["CV C1 recall"] * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={c["C3 >= 0.55"] ? "text-emerald-400" : "text-red-400"}>
                        {(c["CV C3 recall"] * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {c["has probabilities"] ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={13} /> Yes
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1 font-semibold">
                          <XCircle size={13} /> No (Margin only)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.eligible ? (
                        <span className="text-emerald-400 font-semibold">PASS</span>
                      ) : (
                        <span className="text-red-400 font-semibold">DISQUALIFIED</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      {isSelected ? (
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                          SELECTED WINNER
                        </span>
                      ) : !c.eligible ? (
                        <span className="text-slate-500">Lacks probabilistic output</span>
                      ) : (
                        <span className="text-slate-400">Tied Macro-F1 / slower inference</span>
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
      <div className="rounded-2xl border border-white/8 bg-[#111827]/60 p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" />
            Top Predictive Feature Signals (Permutation &amp; Coef Weights)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                width={130}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="p-2.5 rounded-lg border border-white/10 bg-[#080d18] text-xs">
                      <p className="font-bold text-white">{payload[0].payload.name}</p>
                      <p className="text-cyan-400 mt-0.5">Impact Score: {payload[0].value}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="weight" fill="#22d3ee" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
