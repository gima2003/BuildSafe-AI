import {
  Bell,
  CalendarDays,
  ChevronDown,
  Search,
  Database,
  ShieldCheck,
  AlertTriangle,
  Activity,
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


/* =========================================================
   VERIFIED PROJECT DATA
   ========================================================= */

/*
 * Training target distribution from our actual model
 * preparation results.
 */
const severityData = [
  {
    name: "Class 1",
    value: 32213,
    percentage: 39.33,
  },
  {
    name: "Class 2",
    value: 46320,
    percentage: 56.55,
  },
  {
    name: "Class 3",
    value: 3370,
    percentage: 4.11,
  },
];


/*
 * Actual model comparison results.
 */
const modelData = [
  {
    name: "Logistic Regression",
    accuracy: 88.09,
    macroF1: 82.73,
  },
  {
    name: "Decision Tree",
    accuracy: 86.43,
    macroF1: 87.93,
  },
  {
    name: "Linear SVM",
    accuracy: 99.38,
    macroF1: 99.53,
  },
  {
    name: "Naive Bayes",
    accuracy: 94.54,
    macroF1: 89.02,
  },
  {
    name: "Tuned SVM",
    accuracy: 99.39,
    macroF1: 99.53,
  },
  {
    name: "Tuned NB",
    accuracy: 95.07,
    macroF1: 90.96,
  },
];


/* =========================================================
   CUSTOM TOOLTIP
   ========================================================= */

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      className="
        rounded-xl
        border border-white/10
        bg-[#111827]
        px-4
        py-3
        shadow-2xl
      "
    >
      <p className="mb-2 text-xs font-semibold text-white">
        {label}
      </p>

      {payload.map((item) => (
        <p
          key={item.dataKey}
          className="text-xs text-slate-400"
        >
          {item.name}:{" "}
          <span className="font-semibold text-white">
            {typeof item.value === "number"
              ? `${item.value}${item.dataKey !== "value" ? "%" : ""}`
              : item.value}
          </span>
        </p>
      ))}
    </div>
  );
}


/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div
      className="
        group relative overflow-hidden
        rounded-2xl
        border border-white/6
        bg-[#111827]/80
        p-5
        transition-all duration-300
        hover:-translate-y-1
        hover:border-white/12
        hover:shadow-xl
        hover:shadow-black/20
      "
    >

      <div
        className="
          absolute -right-8 -top-8
          h-24 w-24
          rounded-full
          bg-cyan-400
          opacity-[0.06]
          blur-3xl
          transition-opacity
          duration-300
          group-hover:opacity-[0.12]
        "
      />

      <div className="relative">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-xs font-medium text-slate-500">
              {label}
            </p>

            <h3
              className="
                mt-2
                text-2xl
                font-bold
                tracking-tight
                text-white
              "
            >
              {value}
            </h3>

          </div>

          <div
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-white/6
              bg-white/4
            "
          >
            <Icon
              size={19}
              className="text-cyan-400"
            />
          </div>

        </div>

        <p className="mt-4 text-[11px] text-slate-500">
          {description}
        </p>

      </div>
    </div>
  );
}


/* =========================================================
   DASHBOARD
   ========================================================= */

export default function Dashboard() {

  return (
    <div
      className="
        flex
        h-screen
        overflow-hidden
        bg-[#080d18]
        text-white
      "
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main
        className="
          min-w-0
          flex-1
          overflow-y-auto
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            sticky top-0 z-20
            flex h-20.5
            items-center justify-between
            border-b border-white/6
            bg-[#080d18]/90
            px-8
            backdrop-blur-xl
          "
        >

          {/* Search */}

          <div
            className="
              hidden
              items-center gap-3
              rounded-xl
              border border-white/6
              bg-white/2.5
              px-4 py-2.5
              md:flex
            "
          >

            <Search
              size={17}
              className="text-slate-600"
            />

            <input
              type="text"
              placeholder="Search cases, BINs, violations..."
              className="
                w-64
                bg-transparent
                text-sm
                text-white
                outline-none
                placeholder:text-slate-600
              "
            />

          </div>


          {/* Header controls */}

          <div
            className="
              ml-auto
              flex
              items-center
              gap-4
            "
          >

            <button
              type="button"
              className="
                hidden
                items-center gap-2
                rounded-xl
                border border-white/6
                bg-white/2.5
                px-3 py-2
                text-xs text-slate-400
                transition
                hover:bg-white/5
                lg:flex
              "
            >

              <CalendarDays size={15} />

              September 2026

              <ChevronDown size={13} />

            </button>


            <button
              type="button"
              aria-label="Notifications"
              className="
                relative
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                border border-white/6
                bg-white/2.5
                text-slate-400
                transition
                hover:bg-white/6
                hover:text-white
              "
            >

              <Bell size={18} />

              <span
                className="
                  absolute
                  right-2 top-2
                  h-1.5 w-1.5
                  rounded-full
                  bg-cyan-400
                "
              />

            </button>


            <div
              className="
                flex items-center gap-3
                border-l border-white/6
                pl-4
              "
            >

              <div
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-lg
                  bg-linear-to-br
                  from-cyan-500 to-blue-600
                  text-xs font-bold
                "
              >
                BS
              </div>

              <div className="hidden sm:block">

                <p className="text-xs font-semibold text-white">
                  BuildSafe
                </p>

                <p className="text-[10px] text-slate-600">
                  Administrator
                </p>

              </div>

            </div>

          </div>

        </header>


        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <div className="p-8">

          {/* Heading */}

          <section className="mb-8">

            <p
              className="
                mb-2
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-cyan-400
              "
            >
              Intelligence Overview
            </p>

            <div
              className="
                flex
                flex-col
                justify-between
                gap-4
                md:flex-row
                md:items-end
              "
            >

              <div>

                <h1
                  className="
                    text-3xl
                    font-bold
                    tracking-tight
                    text-white
                  "
                >
                  Building Violation Dashboard
                </h1>

                <p
                  className="
                    mt-2
                    max-w-2xl
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Monitor violation patterns, severity
                  distribution, and machine-learning
                  performance from one intelligence workspace.
                </p>

              </div>


              <div
                className="
                  flex items-center gap-2
                  rounded-full
                  border border-emerald-500/10
                  bg-emerald-500/6
                  px-3 py-2
                  text-xs font-medium
                  text-emerald-400
                "
              >

                <span
                  className="
                    h-1.5 w-1.5
                    rounded-full
                    bg-emerald-400
                  "
                />

                ML system operational

              </div>

            </div>

          </section>


          {/* =================================================
              KPI CARDS
          ================================================= */}

          <section
            className="
              grid
              gap-4
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >

            <StatCard
              label="Training Records"
              value="81,903"
              description="Records used to train the models"
              icon={Database}
            />

            <StatCard
              label="Class 2"
              value="56.55%"
              description="46,320 training records"
              icon={AlertTriangle}
            />

            <StatCard
              label="Class 1"
              value="39.33%"
              description="32,213 training records"
              icon={ShieldCheck}
            />

            <StatCard
              label="Tuned SVM Accuracy"
              value="99.39%"
              description="Performance on 20,564 test records"
              icon={Activity}
            />

          </section>


          {/* =================================================
              CHARTS ROW 1
          ================================================= */}

          <section
            className="
              mt-6
              grid
              gap-6
              xl:grid-cols-3
            "
          >

            {/* =============================================
                SEVERITY DISTRIBUTION
            ============================================= */}

            <div
              className="
                rounded-2xl
                border border-white/6
                bg-[#111827]/60
                p-6
              "
            >

              <div className="mb-4">

                <p className="text-sm font-semibold text-white">
                  Severity Distribution
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Training target distribution
                </p>

              </div>


              <div className="h-75">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={severityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                    >

                      {severityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === 0
                              ? "#22d3ee"
                              : index === 1
                                ? "#3b82f6"
                                : "#f59e0b"
                          }
                        />
                      ))}

                    </Pie>

                    <Tooltip
                      content={<ChartTooltip />}
                    />

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "11px",
                        color: "#94a3b8",
                      }}
                    />

                  </PieChart>

                </ResponsiveContainer>

              </div>


              <div
                className="
                  mt-2
                  grid
                  grid-cols-3
                  gap-2
                "
              >

                {severityData.map((item) => (
                  <div
                    key={item.name}
                    className="
                      rounded-xl
                      bg-white/2.5
                      p-3
                      text-center
                    "
                  >

                    <p className="text-[10px] text-slate-600">
                      {item.name}
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        font-bold
                        text-white
                      "
                    >
                      {item.percentage}%
                    </p>

                  </div>
                ))}

              </div>

            </div>


            {/* =============================================
                MODEL PERFORMANCE
            ============================================= */}

            <div
              className="
                rounded-2xl
                border border-white/6
                bg-[#111827]/60
                p-6
                xl:col-span-2
              "
            >

              <div className="mb-4">

                <p className="text-sm font-semibold text-white">
                  Model Performance
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Accuracy and Macro F1 comparison
                </p>

              </div>


              <div className="h-95">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={modelData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 55,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />

                    <XAxis
                      dataKey="name"
                      angle={-25}
                      textAnchor="end"
                      height={70}
                      tick={{
                        fill: "#64748b",
                        fontSize: 10,
                      }}
                    />

                    <YAxis
                      domain={[0, 100]}
                      tick={{
                        fill: "#64748b",
                        fontSize: 10,
                      }}
                      tickFormatter={(value) => `${value}%`}
                    />

                    <Tooltip
                      content={<ChartTooltip />}
                    />

                    <Bar
                      dataKey="accuracy"
                      name="Accuracy"
                      fill="#22d3ee"
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="macroF1"
                      name="Macro F1"
                      fill="#3b82f6"
                      radius={[5, 5, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

          </section>


               <ErrorIntelligence />

          <section
            className="
              mt-6
              rounded-2xl
              border border-white/6
              bg-[#111827]/60
              p-6
            "
          >

            <div
              className="
                flex
                flex-col
                justify-between
                gap-3
                md:flex-row
                md:items-center
              "
            >

              <div>

                <p className="text-sm font-semibold text-white">
                  Current Production Model
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Tuned Linear SVM
                </p>

              </div>


              <div className="flex gap-3">

                <div
                  className="
                    rounded-xl
                    border border-white/6
                    bg-white/2.5
                    px-4 py-3
                  "
                >

                  <p className="text-[10px] text-slate-600">
                    Accuracy
                  </p>

                  <p className="mt-1 text-lg font-bold text-cyan-400">
                    99.39%
                  </p>

                </div>


                <div
                  className="
                    rounded-xl
                    border border-white/6
                    bg-white/2.5
                    px-4 py-3
                  "
                >

                  <p className="text-[10px] text-slate-600">
                    Macro F1
                  </p>

                  <p className="mt-1 text-lg font-bold text-blue-400">
                    99.53%
                  </p>

                </div>


                <div
                  className="
                    rounded-xl
                    border border-white/6
                    bg-white/2.5
                    px-4 py-3
                  "
                >

                  <p className="text-[10px] text-slate-600">
                    Test Errors
                  </p>

                  <p className="mt-1 text-lg font-bold text-amber-400">
                    125
                  </p>

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}