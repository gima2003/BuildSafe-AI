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

export default function PredictSeverity() {
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
      // JS getDay() is 0 for Sunday
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
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-400",
        badge: "bg-red-500/20 text-red-300 border-red-500/40",
        bar: "bg-red-500",
        icon: ShieldAlert,
        title: "Class 1: Immediately Hazardous",
      };
    }
    if (className === "CLASS - 2") {
      return {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-400",
        badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
        bar: "bg-blue-500",
        icon: ShieldCheck,
        title: "Class 2: Major",
      };
    }
    return {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/6 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              Stage 10 · Deployed Client Interface
            </span>
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-white">
            NYC DOB Violation Severity Triage
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time multi-class triage with preprocessed NLP leakage masking, building risk memory, and human review dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/3 px-3.5 py-2 text-right">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Production Model</p>
            <p className="text-xs font-bold text-white">Logistic Regression [tuned]</p>
          </div>
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-2 text-right">
            <p className="text-[10px] text-cyan-300 font-medium uppercase tracking-wider">Human Review Cutoff</p>
            <p className="text-xs font-bold text-cyan-400">&lt; 65.0% Confidence</p>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* QUICK PRESETS BAR */}
      {/* ================================================== */}
      {metadata?.presets && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" />
              Quick Scenario Presets (Click to autofill):
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {metadata.presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className="group relative flex flex-col p-3.5 rounded-xl border border-white/8 bg-[#111827]/70 hover:bg-[#111827] hover:border-cyan-500/40 text-left transition-all duration-200"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {preset.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {preset.subtitle}
                </p>
                <div className="mt-2 text-[10px] font-medium text-cyan-400/90 flex items-center gap-1">
                  Target: <span className="underline">{preset.expected_class}</span>
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
        <div className="lg:col-span-7 bg-[#111827]/60 rounded-2xl border border-white/8 p-6 shadow-xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <FileText size={14} className="text-cyan-400" />
                  Violation Description <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
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
                className="w-full rounded-xl border border-white/10 bg-[#080d18] px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Automatic NLP preprocessing removes explicit target words (e.g. CLASS 1/2/3), dates, URLs, and permit IDs before model inference.
              </p>
            </div>

            {/* Row 2: Borough & Violation Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <MapPin size={14} className="text-cyan-400" />
                  Borough <span className="text-red-400">*</span>
                </label>
                <select
                  name="borough"
                  value={formData.borough}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-white/10 bg-[#080d18] px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="1">1 - Manhattan</option>
                  <option value="2">2 - Bronx</option>
                  <option value="3">3 - Brooklyn</option>
                  <option value="4">4 - Queens</option>
                  <option value="5">5 - Staten Island</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <Layers size={14} className="text-cyan-400" />
                  Violation Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="violation_type"
                  value={formData.violation_type}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-white/10 bg-[#080d18] px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <User size={14} className="text-cyan-400" />
                  Respondent Name
                </label>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Derived: {respType}
                </span>
              </div>
              <input
                type="text"
                name="respondent"
                value={formData.respondent}
                onChange={handleInputChange}
                placeholder="e.g. NYC HOUSING AUTHORITY or EMPIRE REALTY LLC or DOE JOHN"
                className="w-full rounded-xl border border-white/10 bg-[#080d18] px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Replaces PII name with normalized respondent class (GOVERNMENT / ORGANISATION / INDIVIDUAL).
              </p>
            </div>

            {/* Row 4: Issue Date & Aggravation Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Calendar size={14} className="text-cyan-400" />
                    Issue Date <span className="text-red-400">*</span>
                  </label>
                  {dateInfo.day && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        dateInfo.isWeekend
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-white/5 text-slate-400"
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
                  className="w-full rounded-xl border border-white/10 bg-[#080d18] px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <Flame size={14} className="text-cyan-400" />
                  Aggravation Level
                </label>
                <select
                  name="aggravation_level"
                  value={formData.aggravation_level}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-white/10 bg-[#080d18] px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="NO">No Aggravation (Standard)</option>
                  <option value="AGGRAVATED OFFENSE LEVEL 1">Aggravated Level 1</option>
                  <option value="AGGRAVATED OFFENSE LEVEL 2">Aggravated Level 2 (Repeat Offender)</option>
                </select>
              </div>
            </div>

            {/* Row 5: Building ID (BIN) & History Lookup */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Building2 size={14} className="text-cyan-400" />
                  Building Identification Number (BIN)
                </label>
                <span className="text-[11px] text-slate-500">7-digit NYC BIN</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="bin"
                  maxLength={7}
                  value={formData.bin}
                  onChange={handleInputChange}
                  placeholder="e.g. 1000007, 2026562, 5020516"
                  className="flex-1 rounded-xl border border-white/10 bg-[#080d18] px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleBinLookup()}
                  disabled={binLookupLoading || !formData.bin.trim()}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs font-medium text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {binLookupLoading ? (
                    <Loader2 size={14} className="animate-spin text-cyan-400" />
                  ) : (
                    <Search size={14} className="text-cyan-400" />
                  )}
                  Check History
                </button>
              </div>

              {/* BIN History Card Preview */}
              {binHistory && (
                <div className="mt-2 p-3 rounded-xl border border-white/8 bg-white/3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-white">BIN {binHistory.bin}:</span>{" "}
                    {binHistory.exists ? (
                      <span className="text-emerald-400">Found in historical database</span>
                    ) : (
                      <span className="text-slate-400">No prior history record (0 priors)</span>
                    )}
                  </div>
                  {binHistory.exists && (
                    <div className="flex items-center gap-3 text-[11px] text-slate-300">
                      <span>Total Priors: <b className="text-white">{binHistory.total_violations}</b></span>
                      <span>Class 1 Priors: <b className="text-red-400">{binHistory.total_class1}</b></span>
                      {binHistory.last_issue_date && (
                        <span>Last: <b className="text-cyan-400">{binHistory.last_issue_date}</b></span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-sm text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-white" />
                    Running Inference Pipeline...
                  </>
                ) : (
                  <>
                    <BrainCircuit size={18} className="text-white" />
                    Triage Violation Severity
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-4 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 text-slate-300 text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={15} />
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
                    className={`rounded-2xl border ${theme.border} ${theme.bg} p-6 shadow-2xl relative overflow-hidden backdrop-blur-md`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                          AI Triage Assessment
                        </span>
                        <h2 className="mt-1 text-2xl font-black text-white tracking-tight flex items-center gap-2">
                          {result.predicted_class}
                        </h2>
                        <p className={`mt-0.5 text-base font-semibold ${theme.text}`}>
                          {result.meaning}
                        </p>
                      </div>

                      <div className={`p-3 rounded-xl border ${theme.badge}`}>
                        <IconComponent size={28} />
                      </div>
                    </div>

                    {/* CONFIDENCE SECTION */}
                    <div className="mt-6 pt-5 border-t border-white/8">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-medium text-slate-400">Model Confidence</span>
                        <span className="font-bold text-white text-base">
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* HUMAN REVIEW BANNER (STAGE 10 CORE REQUIREMENT) */}
                    <div className="mt-5">
                      {result.needs_human_review ? (
                        <div className="rounded-xl border border-amber-500/40 bg-amber-500/15 p-4 text-amber-200">
                          <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                            <AlertTriangle size={18} className="text-amber-400 shrink-0 animate-bounce" />
                            <span>⚠️ SEND TO HUMAN INSPECTOR</span>
                          </div>
                          <p className="mt-1.5 text-xs text-amber-100/90 leading-relaxed">
                            {result.review_reason}
                          </p>
                          <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px]">
                            <span className="font-medium text-amber-300/80">Protocol: Mandatory On-Site Review</span>
                            <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">
                              Cutoff &lt; 65.0%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-emerald-200 flex items-center gap-2.5 text-xs">
                          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-semibold text-emerald-300">
                              Automated Dispatch Approved
                            </span>
                            <p className="text-[11px] text-emerald-200/80">
                              Confidence passes safety verification threshold (≥ 65.0%).
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PROBABILITIES BREAKDOWN */}
                    <div className="mt-6 pt-5 border-t border-white/8 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Class Probability Distribution
                      </p>

                      {Object.entries(result.probabilities).map(([cName, prob]) => {
                        const isWinner = cName === result.predicted_class;
                        return (
                          <div key={cName} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className={`${isWinner ? "font-bold text-white" : "text-slate-400"}`}>
                                {cName} ({cName === "CLASS - 1" ? "Hazardous" : cName === "CLASS - 2" ? "Major" : "Lesser"})
                              </span>
                              <span className={`font-mono ${isWinner ? "font-bold text-cyan-400" : "text-slate-400"}`}>
                                {(prob * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
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
              <div className="rounded-2xl border border-white/8 bg-[#111827]/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowFeatures(!showFeatures)}
                  className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Layers size={15} className="text-cyan-400" />
                    Inspect Engineered Model Inputs (14 Features)
                  </span>
                  {showFeatures ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showFeatures && result.engineered_features && (
                  <div className="p-4 border-t border-white/6 bg-black/20 text-xs font-mono space-y-2">
                    <div className="text-[11px] text-slate-400 mb-2">
                      Shows exact row-wise transformations fed into the pipeline (Notebook 02 → Pipeline):
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-white/3">
                        <span className="text-slate-500 block">Cleaned Text:</span>
                        <span className="text-cyan-300 truncate block">
                          {result.engineered_features.DESC_CLEAN || "EMPTY"}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-white/3">
                        <span className="text-slate-500 block">Respondent Type:</span>
                        <span className="text-white block font-bold">
                          {result.engineered_features.RESPONDENT_TYPE}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-white/3">
                        <span className="text-slate-500 block">Borough / DOB Unit:</span>
                        <span className="text-white block">
                          Boro {result.engineered_features.BORO} · Unit {result.engineered_features.DOB_UNIT}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-white/3">
                        <span className="text-slate-500 block">Month / Day of Week:</span>
                        <span className="text-white block">
                          Month {result.engineered_features.ISSUE_MONTH} · DoW {result.engineered_features.ISSUE_DAYOFWEEK} (Wknd: {result.engineered_features.IS_WEEKEND})
                        </span>
                      </div>
                      <div className="p-2 rounded bg-white/3">
                        <span className="text-slate-500 block">Prior Violations:</span>
                        <span className="text-white block">
                          Total: {result.engineered_features.BIN_PRIOR_VIOLATIONS} · Class 1: {result.engineered_features.BIN_PRIOR_CLASS1}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-white/3">
                        <span className="text-slate-500 block">Days Since Prev / Words:</span>
                        <span className="text-white block">
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
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#111827]/40 p-8 text-center flex flex-col items-center justify-center min-h-[460px]">
              <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <BrainCircuit size={32} />
              </div>
              <h3 className="text-base font-bold text-white">Ready for Triage Evaluation</h3>
              <p className="mt-2 text-xs text-slate-400 max-w-sm leading-relaxed">
                Fill in the violation details or select one of the quick scenario presets above to classify the severity and verify if human inspection is mandated.
              </p>

              <div className="mt-6 w-full max-w-xs space-y-2 text-left">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-white/2 p-2 rounded-lg border border-white/5">
                  <ShieldAlert size={14} className="text-red-400 shrink-0" />
                  <span>Class 1: Immediately hazardous</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-white/2 p-2 rounded-lg border border-white/5">
                  <ShieldCheck size={14} className="text-blue-400 shrink-0" />
                  <span>Class 2: Major violation</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-white/2 p-2 rounded-lg border border-white/5">
                  <Info size={14} className="text-amber-400 shrink-0" />
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
