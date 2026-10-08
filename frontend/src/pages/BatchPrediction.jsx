import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Info,
  Trash2,
} from "lucide-react";
import { predictCsv, predictBatch } from "../services/api";
import { useTheme } from "../context/ThemeContext";

export default function BatchPrediction() {
  const { isDark } = useTheme();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'review', 'class1', 'class2', 'class3'

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.endsWith(".csv")) {
        setError("Please upload a .csv file.");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await predictCsv(file);
      setResults(res);
    } catch (err) {
      setError(err.message || "Failed to process batch CSV.");
    } finally {
      setLoading(false);
    }
  };

  // Sample CSV generator for quick demo
  const loadDemoBatch = async () => {
    setLoading(true);
    setError(null);
    const demoRecords = [
      {
        description: "FAILURE TO MAINTAIN BUILDING WALL CRACKING OBSERVED ON BEARING WALL. CEASE USE.",
        borough: "1",
        violation_type: "Construction",
        respondent: "ABC CORP LLC",
        issue_date: "2026-06-12",
        aggravation_level: "AGGRAVATED OFFENSE LEVEL 1",
        bin: "1000007",
      },
      {
        description: "WORK WITHOUT A PERMIT. INTERIOR PARTITION WALLS INSTALLED IN RESIDENTIAL APARTMENT.",
        borough: "2",
        violation_type: "Construction",
        respondent: "JOHN SMITH",
        issue_date: "2026-06-15",
        aggravation_level: "NO",
        bin: "2026562",
      },
      {
        description: "OUTDOOR ILLUMINATED SIGN DISPLAYED WITHOUT VALID CERTIFICATE OF REGISTRATION.",
        borough: "4",
        violation_type: "Signs",
        respondent: "CLEAR CHANNEL OUTDOOR INC",
        issue_date: "2026-05-20",
        aggravation_level: "NO",
        bin: "4001234",
      },
      {
        description: "FAILURE TO MAINTAIN EXTERIOR BUILDING WALL REPAIR CRACK",
        borough: "1",
        violation_type: "Construction",
        respondent: "NYC HOUSING AUTHORITY",
        issue_date: "2026-06-15",
        aggravation_level: "NO",
        bin: "1000007",
      },
      {
        description: "FAILURE TO COMPLY WITH COMMISSIONERS ORDER TO PROVIDE EMERGENCY ROOF REPAIR.",
        borough: "3",
        violation_type: "Site Safety",
        respondent: "BROOKLYN HEIGHTS REALTY",
        issue_date: "2026-06-19",
        aggravation_level: "AGGRAVATED OFFENSE LEVEL 2",
        bin: "3000009",
      },
    ];

    try {
      const res = await predictBatch(demoRecords);
      setResults(res);
    } catch (err) {
      setError(err.message || "Failed to run demo batch.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!results || !results.predictions) return;
    const headers = [
      "ID",
      "Predicted Class",
      "Meaning",
      "Confidence",
      "Needs Human Review",
      "Prob Class 1",
      "Prob Class 2",
      "Prob Class 3",
      "Cleaned Description",
      "Borough",
      "Violation Type",
      "Respondent Type",
    ];

    const rows = results.predictions.map((p, i) => [
      i + 1,
      `"${p.predicted_class}"`,
      `"${p.meaning}"`,
      p.confidence,
      p.needs_human_review ? "YES" : "NO",
      p.probabilities["CLASS - 1"] || 0,
      p.probabilities["CLASS - 2"] || 0,
      p.probabilities["CLASS - 3"] || 0,
      `"${(p.engineered_features?.DESC_CLEAN || "").replace(/"/g, '""')}"`,
      p.engineered_features?.BORO || "",
      `"${p.engineered_features?.VIOLATION_TYPE || ""}"`,
      p.engineered_features?.RESPONDENT_TYPE || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BuildSafe_Batch_Triage_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPredictions = results?.predictions?.filter((item) => {
    if (filter === "review") return item.needs_human_review;
    if (filter === "class1") return item.predicted_class === "CLASS - 1";
    if (filter === "class2") return item.predicted_class === "CLASS - 2";
    if (filter === "class3") return item.predicted_class === "CLASS - 3";
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${
        isDark ? "border-white/8" : "border-[#D9DEE5]"
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
              High-Throughput Processing
            </span>
          </div>
          <h1 className={`mt-1.5 text-2xl md:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#1F2937]"}`}>
            Batch Violation Triage
          </h1>
          <p className={`mt-1.5 text-base ${isDark ? "text-slate-300" : "text-[#5B6472]"}`}>
            Upload CSV datasets or batch portfolios for automated multi-record severity classification and human review auditing.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDemoBatch}
          disabled={loading}
          className={`px-5 py-3 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            isDark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-[#D9DEE5] bg-white hover:bg-[#EEF0F3] text-[#1F2937] shadow-xs"
          }`}
        >
          <FileSpreadsheet size={16} className="text-cyan-600 dark:text-cyan-400" />
          Load Demo 5-Case Batch
        </button>
      </div>

      {/* Upload Zone */}
      <div className={`rounded-2xl border border-dashed p-9 text-center backdrop-blur-md ${
        isDark ? "border-white/12 bg-[#111827]/40 text-white" : "border-[#D9DEE5] bg-white text-[#1F2937] shadow-xs"
      }`}>
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 mx-auto flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Upload size={28} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-[#1F2937]"}`}>Upload Violations CSV File</h3>
            <p className={`mt-1.5 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>
              CSV file containing columns: <code className="text-cyan-700 dark:text-cyan-300 font-mono font-semibold">description</code>, <code className="text-cyan-700 dark:text-cyan-300 font-mono font-semibold">borough</code>, <code className="text-cyan-700 dark:text-cyan-300 font-mono font-semibold">violation_type</code>, <code className="text-cyan-700 dark:text-cyan-300 font-mono font-semibold">respondent</code>, <code className="text-cyan-700 dark:text-cyan-300 font-mono font-semibold">issue_date</code>, <code className="text-cyan-700 dark:text-cyan-300 font-mono font-semibold">bin</code>.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3.5 pt-1">
            <label className={`cursor-pointer px-5 py-3 rounded-xl text-sm font-bold border transition-colors ${
              isDark ? "bg-white/10 hover:bg-white/15 text-white border-white/12" : "bg-[#EEF0F3] hover:bg-[#E2E6EA] text-[#1F2937] border-[#D9DEE5]"
            }`}>
              <span>{file ? file.name : "Select CSV File"}</span>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>

            {file && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-sm font-bold text-white transition-all shadow-md shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Run Batch Triage
              </button>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300 text-sm font-medium flex items-center justify-center gap-2.5">
              <AlertTriangle size={17} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Summary KPI Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border ${isDark ? "border-white/10 bg-[#111827]/70" : "border-[#D9DEE5] bg-white shadow-xs"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>Total Processed</p>
              <p className={`text-3xl font-black mt-2 ${isDark ? "text-white" : "text-[#1F2937]"}`}>{results.total_records}</p>
            </div>
            <div className={`p-5 rounded-2xl border ${isDark ? "border-red-500/25 bg-red-500/10 text-red-300" : "border-red-200 bg-red-50 text-red-900"}`}>
              <p className="text-xs font-bold uppercase tracking-wider">Class 1 (Hazardous)</p>
              <p className="text-3xl font-black mt-2 text-red-600 dark:text-red-400">
                {results.predictions.filter((p) => p.predicted_class === "CLASS - 1").length}
              </p>
            </div>
            <div className={`p-5 rounded-2xl border ${isDark ? "border-blue-500/25 bg-blue-500/10 text-blue-300" : "border-blue-200 bg-blue-50 text-blue-900"}`}>
              <p className="text-xs font-bold uppercase tracking-wider">Class 2 (Major)</p>
              <p className="text-3xl font-black mt-2 text-blue-600 dark:text-blue-400">
                {results.predictions.filter((p) => p.predicted_class === "CLASS - 2").length}
              </p>
            </div>
            <div className={`p-5 rounded-2xl border ${isDark ? "border-amber-500/25 bg-amber-500/10 text-amber-300" : "border-amber-300 bg-amber-50 text-amber-950"}`}>
              <p className="text-xs font-bold uppercase tracking-wider">Flagged for Human Inspector</p>
              <p className="text-3xl font-black mt-2 text-amber-600 dark:text-amber-400">
                {results.flagged_for_review_count}
              </p>
            </div>
          </div>

          {/* Table Header / Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Filter size={16} className={isDark ? "text-slate-400" : "text-[#5B6472]"} />
              <span className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-[#1F2937]"}`}>Filter view:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: `All (${results.total_records})` },
                  { id: "review", label: `⚠️ Human Review (${results.flagged_for_review_count})` },
                  { id: "class1", label: "Class 1" },
                  { id: "class2", label: "Class 2" },
                  { id: "class3", label: "Class 3" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-colors cursor-pointer ${
                      filter === f.id
                        ? "bg-cyan-600 text-white font-bold"
                        : isDark
                          ? "bg-white/6 text-slate-300 hover:text-white hover:bg-white/12"
                          : "bg-[#EEF0F3] text-[#1F2937] hover:bg-[#E2E6EA] border border-[#D9DEE5]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className={`px-4.5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors border ${
                isDark
                  ? "bg-white/6 hover:bg-white/12 text-cyan-400 border-white/10"
                  : "bg-white hover:bg-[#EEF0F3] text-cyan-800 border-[#D9DEE5] shadow-xs"
              }`}
            >
              <Download size={16} />
              Export Triage Report (CSV)
            </button>
          </div>

          {/* Table */}
          <div className={`rounded-2xl border overflow-x-auto shadow-xl ${
            isDark ? "border-white/10 bg-[#111827]/70" : "border-[#D9DEE5] bg-white shadow-xs"
          }`}>
            <table className="w-full text-left text-sm">
              <thead className={`border-b uppercase tracking-wider font-bold text-xs ${
                isDark ? "border-white/8 bg-white/3 text-slate-300" : "border-[#D9DEE5] bg-[#F8F9FA] text-[#1F2937]"
              }`}>
                <tr>
                  <th className="py-4 px-4.5">#</th>
                  <th className="py-4 px-4.5">Predicted Class</th>
                  <th className="py-4 px-4.5">Confidence</th>
                  <th className="py-4 px-4.5">Human Inspector Flag</th>
                  <th className="py-4 px-4.5">Description</th>
                  <th className="py-4 px-4.5">Borough</th>
                  <th className="py-4 px-4.5">Type</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/6 text-slate-200" : "divide-[#D9DEE5] text-[#1F2937]"}`}>
                {filteredPredictions?.map((item, idx) => {
                  const isC1 = item.predicted_class === "CLASS - 1";
                  const isC2 = item.predicted_class === "CLASS - 2";
                  return (
                    <tr key={idx} className={isDark ? "hover:bg-white/3 transition-colors" : "hover:bg-[#F8F9FA] transition-colors"}>
                      <td className={`py-4 px-4.5 font-mono ${isDark ? "text-slate-400" : "text-[#5B6472]"}`}>{idx + 1}</td>
                      <td className="py-4 px-4.5 font-bold">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isC1
                              ? isDark ? "bg-red-500/15 text-red-200 border-red-500/35" : "bg-red-100 text-red-900 border-red-300"
                              : isC2
                              ? isDark ? "bg-blue-500/15 text-blue-200 border-blue-500/35" : "bg-blue-100 text-blue-900 border-blue-300"
                              : isDark ? "bg-amber-500/15 text-amber-200 border-amber-500/35" : "bg-amber-100 text-amber-900 border-amber-300"
                          }`}
                        >
                          {isC1 ? <ShieldAlert size={14} /> : isC2 ? <ShieldCheck size={14} /> : <Info size={14} />}
                          {item.predicted_class}
                        </span>
                      </td>
                      <td className={`py-4 px-4.5 font-mono font-bold ${isDark ? "text-white" : "text-[#1F2937]"}`}>
                        {(item.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-4 px-4.5">
                        {item.needs_human_review ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border animate-pulse ${
                            isDark ? "bg-amber-500/25 text-amber-200 border-amber-500/40" : "bg-amber-100 text-amber-900 border-amber-300"
                          }`}>
                            <AlertTriangle size={14} />
                            Send to Inspector
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 size={15} />
                            Automated OK
                          </span>
                        )}
                      </td>
                      <td className={`py-4 px-4.5 max-w-xs truncate ${isDark ? "text-slate-300" : "text-[#5B6472]"}`} title={item.engineered_features?.DESC_CLEAN}>
                        {item.engineered_features?.DESC_CLEAN || "—"}
                      </td>
                      <td className="py-4 px-4.5 font-medium">{item.engineered_features?.BORO || "—"}</td>
                      <td className="py-4 px-4.5 font-medium">{item.engineered_features?.VIOLATION_TYPE || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
