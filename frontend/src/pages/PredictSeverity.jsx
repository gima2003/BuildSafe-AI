import { useState, useEffect } from "react";
import {
  BrainCircuit,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Search,
  Sparkles,
  Building2,
  Calendar,
  User,
  FileText,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Flame,
} from "lucide-react";
import { predictViolation, lookupBin, getMetadata } from "../services/api";
import { useTheme } from "../context/ThemeContext";

export default function PredictSeverity() {
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({
    description: "",
    borough: "1",
    violation_type: "Construction",
    respondent: "",
    issue_date: new Date().toISOString().split("T")[0],
    aggravation_level: "NO",
    bin: "",
    dob_violation_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [binLookupLoading, setBinLookupLoading] = useState(false);
  const [binHistory, setBinHistory] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      const data = await getMetadata();
      setMetadata(data);
    }
    loadMeta();
  }, []);

  // Compute live respondent type preview
  const liveRespondentType = () => {
    const n = (formData.respondent || "").toUpperCase().trim();
    if (!n) return "UNKNOWN";
    const gov = /DEPARTMENT|DEPT|\bNYC\b|CITY OF|HOUSING AUTH|SCHOOL|BOARD OF ED|\bHPD\b|\bDOE\b|AUTHORITY|\bMTA\b|STATE OF/;
    const org = /\bLLC\b|\bINC\b|CORP|\bCO\b|LTD|\bLP\b|ASSOC|REALTY|MGMT|MANAGEMENT|TRUST|CONDO|CONSTRUCT|DEVELOP|PROPERT|HOLDING|GROUP|BUILDERS|CONTRACT|SERVICES|ENTERPRISE|OWNER|CHURCH|HOSPITAL|UNIVERSITY|COOP|CO-OP|HDFC|L\.L\.C/;
    if (gov.test(n)) return "GOVERNMENT";
    if (org.test(n)) return "ORGANISATION";
    return "INDIVIDUAL";
  };

  // Compute live day of week & weekend flag
  const liveDateInfo = () => {
    try {
      const d = new Date(formData.issue_date);
      if (isNaN(d.getTime())) return { day: "", isWeekend: false };
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const jsDay = d.getDay();
      const pythonDow = jsDay === 0 ? 6 : jsDay - 1;
      return {
        day: days[pythonDow],
        isWeekend: pythonDow >= 5,
      };
    } catch {
      return { day: "", isWeekend: false };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handlePresetSelect = (preset) => {
    setFormData(preset.data);
    setResult(null);
    setError(null);
    if (preset.data.bin) {
      handleBinLookup(preset.data.bin);
    } else {
      setBinHistory(null);
    }
  };

  const handleBinLookup = async (binToLookup = formData.bin) => {
    const b = (binToLookup || "").trim();
    if (!b) {
      setBinHistory(null);
      return;
    }
    setBinLookupLoading(true);
    try {
      const res = await lookupBin(b);
      setBinHistory(res);
    } catch {
      setBinHistory(null);
    } finally {
      setBinLookupLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      setError("Please enter a violation description.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await predictViolation(formData);
      setResult(res);
    } catch (err) {
      setError(err.message || "Failed to obtain prediction from backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      description: "",
      borough: "1",
      violation_type: "Construction",
      respondent: "",
      issue_date: new Date().toISOString().split("T")[0],
      aggravation_level: "NO",
      bin: "",
      dob_violation_number: "",
    });
    setResult(null);
    setError(null);
    setBinHistory(null);
  };

  const dateInfo = liveDateInfo();
  const respType = liveRespondentType();

  // Helper colors for classes
  const getClassTheme = (className) => {
    if (className === "CLASS - 1") {
      return {
        bg: isDark ? "bg-red-500/10" : "bg-red-50/90",
        border: isDark ? "border-red-500/30" : "border-red-300",
        text: isDark ? "text-red-300" : "text-red-900",
        badge: isDark ? "bg-red-500/20 text-red-200 border-red-500/40" : "bg-red-100 text-red-900 border-red-300",
        bar: "bg-red-500",
        icon: ShieldAlert,
        title: "Class 1: Immediately Hazardous",
      };
    }
    if (className === "CLASS - 2") {
      return {
        bg: isDark ? "bg-blue-500/10" : "bg-blue-50/90",
        border: isDark ? "border-blue-500/30" : "border-blue-300",
        text: isDark ? "text-blue-300" : "text-blue-900",
        badge: isDark ? "bg-blue-500/20 text-blue-200 border-blue-500/40" : "bg-blue-100 text-blue-900 border-blue-300",
        bar: "bg-blue-500",
        icon: ShieldCheck,
        title: "Class 2: Major",
      };
    }
    return {
      bg: isDark ? "bg-amber-500/10" : "bg-amber-50/90",
      border: isDark ? "border-amber-500/30" : "border-amber-300",
      text: isDark ? "text-amber-300" : "text-amber-900",
      badge: isDark ? "bg-amber-500/20 text-amber-200 border-amber-500/40" : "bg-amber-100 text-amber-900 border-amber-300",
      bar: "bg-amber-500",
      icon: Info,
      title: "Class 3: Lesser",
    };
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* ================================================== */}
      {/* HEADER SECTION */}
      {/* ================================================== */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${
        isDark ? "border-white/8" : "border-[#D9DEE5]"
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase">
              Stage 10 · Deployed Client Interface
            </span>
          </div>
          <h1 className={`mt-1.5 text-2xl md:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#1F2937]"}`}>
            NYC DOB Violation Severity Triage
          </h1>
          <p className={`mt-1.5 text-base ${isDark ? "text-slate-300" : "text-[#5B6472]"}`}>
            Real-time multi-class triage with preprocessed NLP leakage masking, building risk memory, and human review dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3.5">
          <div className={`rounded-xl border px-4 py-2.5 text-right ${
            isDark ? "border-white/10 bg-white/4" : "border-[#D9DEE5] bg-white shadow-xs"
          }`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>Production Model</p>
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-[#1F2937]"}`}>Logistic Regression [tuned]</p>
          </div>
          <div className={`rounded-xl border px-4 py-2.5 text-right ${
            isDark ? "border-cyan-500/25 bg-cyan-500/10" : "border-cyan-200 bg-cyan-50/90 shadow-xs"
          }`}>
            <p className="text-xs text-cyan-700 dark:text-cyan-300 font-semibold uppercase tracking-wider">Human Review Cutoff</p>
            <p className="text-sm font-bold text-cyan-800 dark:text-cyan-400">&lt; 65.0% Confidence</p>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* QUICK PRESETS BAR */}
      {/* ================================================== */}
      {metadata?.presets && (
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <p className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? "text-slate-300" : "text-[#5B6472]"}`}>
              <Sparkles size={16} className="text-cyan-600 dark:text-cyan-400" />
              Quick Scenario Presets (Click to autofill):
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {metadata.presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`group relative flex flex-col p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isDark
                    ? "border-white/10 bg-[#111827]/70 hover:bg-[#111827] hover:border-cyan-500/50 text-white"
                    : "border-[#D9DEE5] bg-white hover:bg-[#F5F6F8] hover:border-cyan-500/70 text-[#1F2937] shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className={`text-sm font-bold transition-colors ${
                    isDark ? "text-white group-hover:text-cyan-400" : "text-[#1F2937] group-hover:text-cyan-700"
                  }`}>
                    {preset.title}
                  </span>
                </div>
                <p className={`text-[13px] line-clamp-2 leading-relaxed ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
                  {preset.subtitle}
                </p>
                <div className="mt-2.5 text-xs font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1">
                  Target: <span className="underline decoration-cyan-400/60">{preset.expected_class}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* MAIN TWO-COLUMN CONTENT */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT: FORM ================= */}
        <div className={`lg:col-span-7 rounded-2xl border p-7 shadow-xl backdrop-blur-md ${
          isDark ? "bg-[#111827]/70 border-white/10" : "bg-white border-[#D9DEE5] shadow-xs"
        }`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-[#1F2937]"}`}>
                  <FileText size={16} className="text-cyan-600 dark:text-cyan-400" />
                  Violation Description <span className="text-red-500 font-bold">*</span>
                </label>
                <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
                  {formData.description.trim().split(/\s+/).filter(Boolean).length} words · {formData.description.length} chars
                </span>
              </div>
              <textarea
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter raw violation text from summons/notice (e.g. WORK WITHOUT A PERMIT. OBSERVED FAILURE TO MAINTAIN EXTERIOR WALL...)"
                className={`w-full rounded-xl border px-4 py-3 text-base transition-colors focus:outline-none focus:ring-2 ${
                  isDark
                    ? "border-white/12 bg-[#080d18] text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                    : "border-[#D9DEE5] bg-[#F7F8FA] text-[#1F2937] placeholder-[#5B6472]/70 focus:border-cyan-600 focus:bg-white focus:ring-cyan-500/20"
                }`}
              />
              <p className={`mt-2 text-xs md:text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
                Automatic NLP preprocessing removes explicit target words (e.g. CLASS 1/2/3), dates, URLs, and permit IDs before model inference.
              </p>
            </div>

            {/* Row 2: Borough & Violation Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDark ? "text-slate-100" : "text-[#1F2937]"}`}>
                  <MapPin size={16} className="text-cyan-600 dark:text-cyan-400" />
                  Borough <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  name="borough"
                  value={formData.borough}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 ${
                    isDark
                      ? "border-white/12 bg-[#080d18] text-white focus:border-cyan-400 focus:ring-cyan-400/20"
                      : "border-[#D9DEE5] bg-[#F7F8FA] text-[#1F2937] focus:border-cyan-600 focus:bg-white focus:ring-cyan-500/20"
                  }`}
                >
                  <option value="1">1 - Manhattan</option>
                  <option value="2">2 - Bronx</option>
                  <option value="3">3 - Brooklyn</option>
                  <option value="4">4 - Queens</option>
                  <option value="5">5 - Staten Island</option>
                </select>
              </div>

              <div>
                <label className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDark ? "text-slate-100" : "text-[#1F2937]"}`}>
                  <Layers size={16} className="text-cyan-600 dark:text-cyan-400" />
                  Violation Type <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  name="violation_type"
                  value={formData.violation_type}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 ${
                    isDark
                      ? "border-white/12 bg-[#080d18] text-white focus:border-cyan-400 focus:ring-cyan-400/20"
                      : "border-[#D9DEE5] bg-[#F7F8FA] text-[#1F2937] focus:border-cyan-600 focus:bg-white focus:ring-cyan-500/20"
                  }`}
                >
                  {(metadata?.violation_types || [
                    "Boilers",
                    "Construction",
                    "Cranes and Derricks",
                    "Elevators",
                    "Local Law",
                    "Plumbing",
                    "Public Assembly",
                    "Quality of Life",
                    "Signs",
                    "Site Safety",
                    "Unknown",
                    "Zoning",
                  ]).map((vt) => (
                    <option key={vt} value={vt}>
                      {vt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Respondent Name */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-[#1F2937]"}`}>
                  <User size={16} className="text-cyan-600 dark:text-cyan-400" />
                  Respondent Name
                </label>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                  isDark ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/25" : "text-cyan-800 bg-cyan-50 border-cyan-200"
                }`}>
                  Derived: {respType}
                </span>
              </div>
              <input
                type="text"
                name="respondent"
                value={formData.respondent}
                onChange={handleInputChange}
                placeholder="e.g. NYC HOUSING AUTHORITY or EMPIRE REALTY LLC or DOE JOHN"
                className={`w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 ${
                  isDark
                    ? "border-white/12 bg-[#080d18] text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                    : "border-[#D9DEE5] bg-[#F7F8FA] text-[#1F2937] placeholder-[#5B6472]/70 focus:border-cyan-600 focus:bg-white focus:ring-cyan-500/20"
                }`}
              />
              <p className={`mt-2 text-xs md:text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
                Replaces PII name with normalized respondent class (GOVERNMENT / ORGANISATION / INDIVIDUAL).
              </p>
            </div>

            {/* Row 4: Issue Date & Aggravation Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-[#1F2937]"}`}>
                    <Calendar size={16} className="text-cyan-600 dark:text-cyan-400" />
                    Issue Date <span className="text-red-500 font-bold">*</span>
                  </label>
                  {dateInfo.day && (
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        dateInfo.isWeekend
                          ? isDark
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                          : isDark
                            ? "bg-white/10 text-slate-300 border border-white/10"
                            : "bg-[#EEF0F3] text-[#1F2937] border border-[#D9DEE5]"
                      }`}
                    >
                      {dateInfo.day} {dateInfo.isWeekend ? "(Weekend)" : ""}
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  name="issue_date"
                  required
                  value={formData.issue_date}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 ${
                    isDark
                      ? "border-white/12 bg-[#080d18] text-white focus:border-cyan-400 focus:ring-cyan-400/20"
                      : "border-[#D9DEE5] bg-[#F7F8FA] text-[#1F2937] focus:border-cyan-600 focus:bg-white focus:ring-cyan-500/20"
                  }`}
                />
              </div>

              <div>
                <label className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDark ? "text-slate-100" : "text-[#1F2937]"}`}>
                  <Flame size={16} className="text-cyan-600 dark:text-cyan-400" />
                  Aggravation Level
                </label>
                <select
                  name="aggravation_level"
                  value={formData.aggravation_level}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 ${
                    isDark
                      ? "border-white/12 bg-[#080d18] text-white focus:border-cyan-400 focus:ring-cyan-400/20"
                      : "border-[#D9DEE5] bg-[#F7F8FA] text-[#1F2937] focus:border-cyan-600 focus:bg-white focus:ring-cyan-500/20"
                  }`}
                >
                  <option value="NO">No Aggravation (Standard)</option>
                  <option value="AGGRAVATED OFFENSE LEVEL 1">Aggravated Level 1</option>
                  <option value="AGGRAVATED OFFENSE LEVEL 2">Aggravated Level 2 (Repeat Offender)</option>
                </select>
              </div>
            </div>

            {/* Row 5: Building ID (BIN) & History Lookup */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-[#1F2937]"}`}>
                  <Building2 size={16} className="text-cyan-600 dark:text-cyan-400" />
                  Building Identification Number (BIN)
                </label>
                <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>7-digit NYC BIN</span>
              </div>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  name="bin"
                  maxLength={7}
                  value={formData.bin}
                  onChange={handleInputChange}
                  placeholder="e.g. 1000007, 2026562, 5020516"
                  className={`flex-1 rounded-xl border px-4 py-3 text-base font-mono focus:outline-none focus:ring-2 ${
                    isDark
                      ? "border-white/12 bg-[#080d18] text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                      : "border-[#D9DEE5] bg-[#F7F8FA] text-[#1F2937] placeholder-[#5B6472]/70 focus:border-cyan-600 focus:bg-white focus:ring-cyan-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleBinLookup()}
                  disabled={binLookupLoading || !formData.bin.trim()}
                  className={`px-5 py-3 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                    isDark
                      ? "border-white/12 bg-white/6 hover:bg-white/12 text-white"
                      : "border-[#D9DEE5] bg-[#EEF0F3] hover:bg-[#E2E6EA] text-[#1F2937]"
                  }`}
                >
                  {binLookupLoading ? (
                    <Loader2 size={16} className="animate-spin text-cyan-500" />
                  ) : (
                    <Search size={16} className="text-cyan-600 dark:text-cyan-400" />
                  )}
                  Check History
                </button>
              </div>

              {/* BIN History Card Preview */}
              {binHistory && (
                <div className={`mt-3 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-sm ${
                  isDark ? "border-white/10 bg-white/4" : "border-[#D9DEE5] bg-[#EEF0F3]"
                }`}>
                  <div>
                    <span className={`font-bold ${isDark ? "text-white" : "text-[#1F2937]"}`}>BIN {binHistory.bin}:</span>{" "}
                    {binHistory.exists ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Found in historical database</span>
                    ) : (
                      <span className={isDark ? "text-slate-400" : "text-[#5B6472]"}>No prior history record (0 priors)</span>
                    )}
                  </div>
                  {binHistory.exists && (
                    <div className={`flex items-center gap-4 text-xs md:text-sm ${isDark ? "text-slate-300" : "text-[#1F2937]"}`}>
                      <span>Total Priors: <b className="font-extrabold">{binHistory.total_violations}</b></span>
                      <span>Class 1 Priors: <b className="text-red-600 dark:text-red-400 font-extrabold">{binHistory.total_class1}</b></span>
                      {binHistory.last_issue_date && (
                        <span>Last: <b className="text-cyan-700 dark:text-cyan-400">{binHistory.last_issue_date}</b></span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300 text-sm font-medium flex items-center gap-2.5">
                <AlertTriangle size={18} className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3.5 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 px-6 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-base text-white shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin text-white" />
                    Running Inference Pipeline...
                  </>
                ) : (
                  <>
                    <BrainCircuit size={20} className="text-white" />
                    Triage Violation Severity
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className={`py-3.5 px-5 rounded-xl border text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                  isDark
                    ? "border-white/12 bg-white/5 hover:bg-white/10 text-slate-200"
                    : "border-[#D9DEE5] bg-[#EEF0F3] hover:bg-[#E2E6EA] text-[#1F2937]"
                }`}
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* ================= RIGHT: RESULT PANEL ================= */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* PRIMARY PREDICTION CARD */}
              {(() => {
                const theme = getClassTheme(result.predicted_class);
                const IconComponent = theme.icon;

                return (
                  <div
                    className={`rounded-2xl border ${theme.border} ${theme.bg} p-7 shadow-xl relative overflow-hidden backdrop-blur-md`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-xs uppercase font-extrabold tracking-widest ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
                          AI Triage Assessment
                        </span>
                        <h2 className={`mt-1.5 text-3xl font-black tracking-tight flex items-center gap-2 ${isDark ? "text-white" : "text-[#1F2937]"}`}>
                          {result.predicted_class}
                        </h2>
                        <p className={`mt-1 text-lg font-bold ${theme.text}`}>
                          {result.meaning}
                        </p>
                      </div>

                      <div className={`p-3.5 rounded-xl border ${theme.badge}`}>
                        <IconComponent size={30} />
                      </div>
                    </div>

                    {/* CONFIDENCE SECTION */}
                    <div className={`mt-6 pt-5 border-t ${isDark ? "border-white/8" : "border-slate-300/70"}`}>
                      <div className="flex items-center justify-between text-sm mb-2.5">
                        <span className={`font-bold ${isDark ? "text-slate-300" : "text-[#5B6472]"}`}>Model Confidence</span>
                        <span className={`font-black text-lg ${isDark ? "text-white" : "text-[#1F2937]"}`}>
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className={`h-3 w-full rounded-full overflow-hidden p-0.5 ${isDark ? "bg-black/40" : "bg-slate-200"}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* HUMAN REVIEW BANNER (STAGE 10 CORE REQUIREMENT) */}
                    <div className="mt-6">
                      {result.needs_human_review ? (
                        <div className={`rounded-xl border p-5 ${
                          isDark
                            ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                            : "border-amber-400 bg-amber-50 text-amber-950 shadow-xs"
                        }`}>
                          <div className="flex items-center gap-2 font-black text-base text-amber-900 dark:text-amber-300">
                            <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 animate-bounce" />
                            <span>⚠️ SEND TO HUMAN INSPECTOR</span>
                          </div>
                          <p className={`mt-2 text-sm font-semibold leading-relaxed ${isDark ? "text-amber-100/90" : "text-amber-900"}`}>
                            {result.review_reason}
                          </p>
                          <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${
                            isDark ? "border-amber-500/25" : "border-amber-300/80"
                          }`}>
                            <span className="font-bold text-amber-800 dark:text-amber-300">Protocol: Mandatory On-Site Review</span>
                            <span className="font-mono bg-amber-200 dark:bg-amber-500/30 px-2.5 py-1 rounded text-amber-900 dark:text-amber-200 font-bold">
                              Cutoff &lt; 65.0%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className={`rounded-xl border p-4 flex items-center gap-3 text-sm ${
                          isDark
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                            : "border-emerald-300 bg-emerald-50 text-emerald-950"
                        }`}>
                          <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-bold text-emerald-800 dark:text-emerald-300">
                              Automated Dispatch Approved
                            </span>
                            <p className="text-xs text-emerald-900/85 dark:text-emerald-200/80 mt-0.5">
                              Confidence passes safety verification threshold (≥ 65.0%).
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PROBABILITIES BREAKDOWN */}
                    <div className={`mt-6 pt-5 border-t space-y-3.5 ${isDark ? "border-white/8" : "border-slate-300/70"}`}>
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
                        Class Probability Distribution
                      </p>

                      {Object.entries(result.probabilities).map(([cName, prob]) => {
                        const isWinner = cName === result.predicted_class;
                        return (
                          <div key={cName} className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className={`${isWinner ? `font-bold ${isDark ? "text-white" : "text-[#1F2937]"}` : isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
                                {cName} ({cName === "CLASS - 1" ? "Hazardous" : cName === "CLASS - 2" ? "Major" : "Lesser"})
                              </span>
                              <span className={`font-mono ${isWinner ? "font-bold text-cyan-600 dark:text-cyan-400" : isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
                                {(prob * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? "bg-black/40" : "bg-slate-200"}`}>
                              <div
                                className={`h-full rounded-full ${
                                  cName === "CLASS - 1"
                                    ? "bg-red-500"
                                    : cName === "CLASS - 2"
                                    ? "bg-blue-500"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${prob * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* COLLAPSIBLE FEATURE ENGINEERING INSPECTION */}
              <div className={`rounded-2xl border overflow-hidden ${
                isDark ? "border-white/8 bg-[#111827]/60" : "border-[#D9DEE5] bg-white shadow-xs"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowFeatures(!showFeatures)}
                  className={`w-full p-4.5 flex items-center justify-between text-left text-sm font-bold transition-colors cursor-pointer ${
                    isDark ? "text-slate-200 hover:text-white" : "text-[#1F2937] hover:text-black"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers size={17} className="text-cyan-600 dark:text-cyan-400" />
                    Inspect Engineered Model Inputs (14 Features)
                  </span>
                  {showFeatures ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {showFeatures && result.engineered_features && (
                  <div className={`p-4.5 border-t text-xs font-mono space-y-2.5 ${
                    isDark ? "border-white/6 bg-black/20" : "border-[#D9DEE5] bg-[#F7F8FA]"
                  }`}>
                    <div className={`text-xs mb-2 ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
                      Shows exact row-wise transformations fed into the pipeline (Notebook 02 → Pipeline):
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className={`p-2.5 rounded-lg ${isDark ? "bg-white/4 border border-white/8" : "bg-white border border-[#D9DEE5]"}`}>
                        <span className={isDark ? "text-slate-400 block" : "text-[#5B6472] block font-medium"}>Cleaned Text:</span>
                        <span className="text-cyan-700 dark:text-cyan-300 truncate block font-bold mt-0.5">
                          {result.engineered_features.DESC_CLEAN || "EMPTY"}
                        </span>
                      </div>
                      <div className={`p-2.5 rounded-lg ${isDark ? "bg-white/4 border border-white/8" : "bg-white border border-[#D9DEE5]"}`}>
                        <span className={isDark ? "text-slate-400 block" : "text-[#5B6472] block font-medium"}>Respondent Type:</span>
                        <span className={`block font-bold mt-0.5 ${isDark ? "text-white" : "text-[#1F2937]"}`}>
                          {result.engineered_features.RESPONDENT_TYPE}
                        </span>
                      </div>
                      <div className={`p-2.5 rounded-lg ${isDark ? "bg-white/4 border border-white/8" : "bg-white border border-[#D9DEE5]"}`}>
                        <span className={isDark ? "text-slate-400 block" : "text-[#5B6472] block font-medium"}>Borough / DOB Unit:</span>
                        <span className={`block font-bold mt-0.5 ${isDark ? "text-white" : "text-[#1F2937]"}`}>
                          Boro {result.engineered_features.BORO} · Unit {result.engineered_features.DOB_UNIT}
                        </span>
                      </div>
                      <div className={`p-2.5 rounded-lg ${isDark ? "bg-white/4 border border-white/8" : "bg-white border border-[#D9DEE5]"}`}>
                        <span className={isDark ? "text-slate-400 block" : "text-[#5B6472] block font-medium"}>Month / Day of Week:</span>
                        <span className={`block font-bold mt-0.5 ${isDark ? "text-white" : "text-[#1F2937]"}`}>
                          Month {result.engineered_features.ISSUE_MONTH} · DoW {result.engineered_features.ISSUE_DAYOFWEEK} (Wknd: {result.engineered_features.IS_WEEKEND})
                        </span>
                      </div>
                      <div className={`p-2.5 rounded-lg ${isDark ? "bg-white/4 border border-white/8" : "bg-white border border-[#D9DEE5]"}`}>
                        <span className={isDark ? "text-slate-400 block" : "text-[#5B6472] block font-medium"}>Prior Violations:</span>
                        <span className={`block font-bold mt-0.5 ${isDark ? "text-white" : "text-[#1F2937]"}`}>
                          Total: {result.engineered_features.BIN_PRIOR_VIOLATIONS} · Class 1: {result.engineered_features.BIN_PRIOR_CLASS1}
                        </span>
                      </div>
                      <div className={`p-2.5 rounded-lg ${isDark ? "bg-white/4 border border-white/8" : "bg-white border border-[#D9DEE5]"}`}>
                        <span className={isDark ? "text-slate-400 block" : "text-[#5B6472] block font-medium"}>Days Since Prev / Words:</span>
                        <span className={`block font-bold mt-0.5 ${isDark ? "text-white" : "text-[#1F2937]"}`}>
                          Gap: {result.engineered_features.BIN_DAYS_SINCE_PREV} d · Words: {result.engineered_features.DESC_WORDS}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* EMPTY STATE GUIDE */
            <div className={`rounded-2xl border border-dashed p-8 text-center flex flex-col items-center justify-center min-h-[480px] ${
              isDark ? "border-white/10 bg-[#111827]/40" : "border-[#D9DEE5] bg-white shadow-xs"
            }`}>
              <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
                <BrainCircuit size={34} />
              </div>
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-[#1F2937]"}`}>Ready for Triage Evaluation</h3>
              <p className={`mt-2 text-sm max-w-sm leading-relaxed ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
                Fill in the violation details or select one of the quick scenario presets above to classify the severity and verify if human inspection is mandated.
              </p>

              <div className="mt-6 w-full max-w-xs space-y-2.5 text-left">
                <div className={`flex items-center gap-2.5 text-xs font-semibold p-3 rounded-xl border ${
                  isDark ? "text-slate-300 bg-white/3 border-white/6" : "text-[#1F2937] bg-[#EEF0F3] border-[#D9DEE5]"
                }`}>
                  <ShieldAlert size={16} className="text-red-500 shrink-0" />
                  <span>Class 1: Immediately hazardous</span>
                </div>
                <div className={`flex items-center gap-2.5 text-xs font-semibold p-3 rounded-xl border ${
                  isDark ? "text-slate-300 bg-white/3 border-white/6" : "text-[#1F2937] bg-[#EEF0F3] border-[#D9DEE5]"
                }`}>
                  <ShieldCheck size={16} className="text-blue-500 shrink-0" />
                  <span>Class 2: Major violation</span>
                </div>
                <div className={`flex items-center gap-2.5 text-xs font-semibold p-3 rounded-xl border ${
                  isDark ? "text-slate-300 bg-white/3 border-white/6" : "text-[#1F2937] bg-[#EEF0F3] border-[#D9DEE5]"
                }`}>
                  <Info size={16} className="text-amber-500 shrink-0" />
                  <span>Class 3: Lesser violation</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
