import {
  AlertTriangle,
  ArrowRight,
  CircleAlert,
  Target,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";

const errorByViolationType = [
  {
    name: "Unknown",
    errors: 52,
  },
  {
    name: "Construction",
    errors: 45,
  },
  {
    name: "Plumbing",
    errors: 9,
  },
  {
    name: "Elevators",
    errors: 8,
  },
  {
    name: "Signs",
    errors: 6,
  },
  {
    name: "Cranes",
    errors: 4,
  },
  {
    name: "Zoning",
    errors: 1,
  },
];

const errorTransitions = [
  {
    actual: "Class 1",
    predicted: "Class 2",
    count: 46,
  },
  {
    actual: "Class 2",
    predicted: "Class 1",
    count: 77,
  },
  {
    actual: "Class 2",
    predicted: "Class 3",
    count: 1,
  },
  {
    actual: "Class 3",
    predicted: "Class 1",
    count: 1,
  },
];

function ErrorTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#D9DEE5] dark:border-white/10 bg-white dark:bg-[#111827] px-4 py-3 shadow-xl text-[#1F2937] dark:text-white">
      <p className="text-sm font-bold">
        {label}
      </p>
      <p className="mt-1 text-xs font-medium text-[#5B6472] dark:text-slate-400">
        Errors:{" "}
        <span className="font-bold text-[#1F2937] dark:text-white">
          {payload[0].value}
        </span>
      </p>
    </div>
  );
}

function ErrorMetric({
  icon: Icon,
  label,
  value,
  description,
  isDark,
}) {
  return (
    <div
      className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
        isDark ? "border-white/10 bg-[#111827]/70 text-white" : "border-[#D9DEE5] bg-white text-[#1F2937] shadow-xs hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-semibold ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
            {label}
          </p>
          <p className={`mt-2.5 text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-[#1F2937]"}`}>
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Icon size={20} className="text-amber-600 dark:text-amber-400" />
        </div>
      </div>

      <p className={`mt-3 text-xs font-medium ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
        {description}
      </p>
    </div>
  );
}

export default function ErrorIntelligence() {
  const { isDark } = useTheme();

  return (
    <section className="mt-8">
      {/* SECTION HEADER */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
          <h2 className={`text-xl font-extrabold ${isDark ? "text-white" : "text-[#1F2937]"}`}>
            Error Intelligence
          </h2>
        </div>
        <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-[#5B6472]"}`}>
          Analysis of test prediction errors across violation categories and class boundaries.
        </p>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid gap-5 sm:grid-cols-3">
        <ErrorMetric
          icon={CircleAlert}
          label="Incorrect Predictions"
          value="125"
          description="Out of 20,564 test records"
          isDark={isDark}
        />

        <ErrorMetric
          icon={Target}
          label="Error Rate"
          value="0.6079%"
          description="Overall test-set error rate"
          isDark={isDark}
        />

        <ErrorMetric
          icon={AlertTriangle}
          label="Largest Error Source"
          value="Unknown"
          description="52 of the 125 incorrect predictions"
          isDark={isDark}
        />
      </div>

      {/* ERROR ANALYSIS GRID */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* ERRORS BY VIOLATION TYPE */}
        <div className={`rounded-2xl border p-7 xl:col-span-2 ${
          isDark ? "border-white/10 bg-[#111827]/70" : "border-[#D9DEE5] bg-white shadow-xs"
        }`}>
          <div className="mb-5">
            <p className={`text-base font-bold ${isDark ? "text-white" : "text-[#1F2937]"}`}>
              Errors by Violation Type
            </p>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-[#5B6472]"}`}>
              Number of incorrect predictions associated with each violation type.
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={errorByViolationType}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 20,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  horizontal={false}
                  stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{
                    fill: isDark ? "#94a3b8" : "#5b6472",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{
                    fill: isDark ? "#cbd5e1" : "#1f2937",
                    fontSize: 12,
                  }}
                />

                <Tooltip content={<ErrorTooltip />} />

                <Bar
                  dataKey="errors"
                  fill="#f59e0b"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP CONFUSION TRANSITIONS */}
        <div className={`rounded-2xl border p-7 ${
          isDark ? "border-white/10 bg-[#111827]/70" : "border-[#D9DEE5] bg-white shadow-xs"
        }`}>
          <div className="mb-5">
            <p className={`text-base font-bold ${isDark ? "text-white" : "text-[#1F2937]"}`}>
              Top Misclassification Transitions
            </p>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-[#5B6472]"}`}>
              Where the model confuses severity classes.
            </p>
          </div>

          <div className="space-y-3.5">
            {errorTransitions.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-xl p-4 border ${
                  isDark ? "border-white/8 bg-white/3" : "border-[#D9DEE5] bg-[#EEF0F3]"
                }`}
              >
                <div className="flex items-center gap-2.5 text-sm">
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {item.actual}
                  </span>
                  <ArrowRight size={15} className="text-slate-400" />
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {item.predicted}
                  </span>
                </div>

                <span className="rounded-lg bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 px-3 py-1 text-xs font-black text-amber-900 dark:text-amber-300">
                  {item.count} cases
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}