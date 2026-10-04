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

export default function BatchPrediction() {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/6 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400" />
            <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
              High-Throughput Processing
            </span>
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-white">
            Batch Violation Triage
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Upload CSV datasets or batch portfolios for automated multi-record severity classification and human review auditing.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDemoBatch}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-all flex items-center gap-2 cursor-pointer"
        >
          <FileSpreadsheet size={15} className="text-cyan-400" />
          Load Demo 5-Case Batch
        </button>
      </div>

      {/* Upload Zone */}
      <div className="rounded-2xl border border-dashed border-white/12 bg-[#111827]/40 p-8 text-center backdrop-blur-md">
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center text-cyan-400">
            <Upload size={26} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Upload Violations CSV File</h3>
            <p className="mt-1 text-xs text-slate-400">
              CSV file containing columns: <code className="text-cyan-300">description</code>, <code className="text-cyan-300">borough</code>, <code className="text-cyan-300">violation_type</code>, <code className="text-cyan-300">respondent</code>, <code className="text-cyan-300">issue_date</code>, <code className="text-cyan-300">bin</code>.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-xs font-semibold text-white border border-white/10 transition-colors">
              <span>{file ? file.name : "Select CSV File"}</span>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>

            {file && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Run Batch Triage
              </button>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center justify-center gap-2">
              <AlertTriangle size={15} />
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
            <div className="p-4 rounded-xl border border-white/8 bg-[#111827]/70">
              <p className="text-[11px] text-slate-400 font-medium">Total Processed</p>
              <p className="text-2xl font-bold text-white mt-1">{results.total_records}</p>
            </div>
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <p className="text-[11px] text-red-300 font-medium">Class 1 (Hazardous)</p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {results.predictions.filter((p) => p.predicted_class === "CLASS - 1").length}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <p className="text-[11px] text-blue-300 font-medium">Class 2 (Major)</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {results.predictions.filter((p) => p.predicted_class === "CLASS - 2").length}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <p className="text-[11px] text-amber-300 font-medium">Flagged for Human Inspector</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {results.flagged_for_review_count}
              </p>
            </div>
          </div>

          {/* Table Header / Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-500" />
              <span className="text-xs text-slate-400 font-medium">Filter view:</span>
              <div className="flex gap-1.5">
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
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      filter === f.id
                        ? "bg-white/15 text-white"
                        : "bg-white/3 text-slate-400 hover:text-white"
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
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-cyan-400 border border-white/10 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Download size={14} />
              Export Triage Report (CSV)
            </button>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/8 bg-[#111827]/60 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/8 bg-white/2 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Predicted Class</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Human Inspector Flag</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Borough</th>
                  <th className="py-3 px-4">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6 text-slate-300">
                {filteredPredictions?.map((item, idx) => {
                  const isC1 = item.predicted_class === "CLASS - 1";
                  const isC2 = item.predicted_class === "CLASS - 2";
                  return (
                    <tr key={idx} className="hover:bg-white/2 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            isC1
                              ? "bg-red-500/10 text-red-300 border-red-500/30"
                              : isC2
                              ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {isC1 ? <ShieldAlert size={12} /> : isC2 ? <ShieldCheck size={12} /> : <Info size={12} />}
                          {item.predicted_class}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-white">
                        {(item.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4">
                        {item.needs_human_review ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            <AlertTriangle size={12} />
                            Send to Inspector
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <CheckCircle2 size={13} />
                            Automated OK
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-400" title={item.engineered_features?.DESC_CLEAN}>
                        {item.engineered_features?.DESC_CLEAN || "—"}
                      </td>
                      <td className="py-3.5 px-4">{item.engineered_features?.BORO || "—"}</td>
                      <td className="py-3.5 px-4">{item.engineered_features?.VIOLATION_TYPE || "—"}</td>
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
