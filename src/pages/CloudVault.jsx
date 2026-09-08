import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, Lock, RefreshCw, Eye, Tag, GitBranch, Copy, Check } from 'lucide-react';
import { getCloudPHRList } from '../services/api';

export default function CloudVault() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchCloudRecords = async () => {
    try {
      setLoading(true);
      const res = await getCloudPHRList();
      if (res.data.success) {
        setRecords(res.data.records);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCloudRecords();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-6 sm:p-7 rounded-2xl text-white shadow-xl border border-sky-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center space-x-2 text-sky-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
              <Database className="w-4 h-4 text-sky-400" />
              <span>Honest-but-Curious Cloud Server Storage Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Encrypted Ciphertext & Index Storage Repository
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              This panel displays the exact data stored on the Cloud Server. As assumed in the research paper, the cloud is **Honest-but-Curious**: it accurately executes search queries, but cannot read plaintext medical payloads or search terms.
            </p>
          </div>

          <button
            onClick={fetchCloudRecords}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur border border-white/20 transition hover:border-white/30 shrink-0 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Storage</span>
          </button>
        </div>
      </div>

      {/* Cloud Records Table */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Cloud Stored Ciphertext Objects ({records.length})</span>
          </h3>
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Zero Plaintext Leakage
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 bg-slate-50/80">
                <th className="py-3 px-3">PHR ID & Name</th>
                <th className="py-3 px-3">Patient Owner</th>
                <th className="py-3 px-3">Encrypted Ciphertext Payload (HEX)</th>
                <th className="py-3 px-3">Encrypted Index Tokens</th>
                <th className="py-3 px-3">Access Tree Policy</th>
                <th className="py-3 px-3 text-right">Inspect Object</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No ciphertext records currently stored in Cloud Vault.
                  </td>
                </tr>
              ) : (
                records.map((rec, idx) => (
                  <tr key={rec.phrId || idx} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{rec.recordName}</div>
                      <div className="text-[11px] font-mono text-sky-600 font-bold flex items-center space-x-1 mt-0.5">
                        <span>{rec.phrId}</span>
                        <button 
                          onClick={() => handleCopy(rec.phrId, rec.phrId)}
                          className="text-slate-400 hover:text-sky-600 transition"
                        >
                          {copiedId === rec.phrId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {rec.patientName}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-semibold inline-block max-w-xs truncate">
                        {rec.encryptedPayloadSnippet}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        <Tag className="w-3 h-3 text-sky-600" />
                        <span>{rec.encryptedIndexesCount} Blind Tokens</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <GitBranch className="w-3 h-3 text-emerald-600" />
                        <span>{rec.policyTree.operator || 'AND'} Tree</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition flex items-center space-x-1 ml-auto active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Inspect Raw</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Object Inspector Modal */}
      {selectedRecord && (
        <div className="bg-sky-50/90 p-6 rounded-2xl border border-sky-200 space-y-4 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between border-b border-sky-200 pb-3">
            <h3 className="text-sm font-bold text-sky-950 flex items-center space-x-2">
              <Eye className="w-4 h-4 text-sky-600" />
              <span>Raw Cloud Storage Metadata Object: {selectedRecord.phrId}</span>
            </h3>
            <button
              onClick={() => setSelectedRecord(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
            >
              ✕ Close
            </button>
          </div>

          <div className="p-4.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-96 leading-relaxed shadow-inner">
            {JSON.stringify(selectedRecord, null, 2)}
          </div>
        </div>
      )}

    </div>
  );
}
