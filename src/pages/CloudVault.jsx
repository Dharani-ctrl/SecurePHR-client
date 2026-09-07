import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, Lock, RefreshCw, Eye, Tag, GitBranch } from 'lucide-react';
import { getCloudPHRList } from '../services/api';

export default function CloudVault() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

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

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-sky-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              <span>Honest-but-Curious Cloud Server Storage Vault</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Encrypted Ciphertext & Index Storage Repository</h1>
            <p className="text-sm text-slate-200 max-w-3xl mt-1">
              This panel displays the exact data stored on the Cloud Server. As assumed in the paper, the cloud is **Honest-but-Curious**: it accurately executes search queries, but cannot read plaintext medical payloads or search terms.
            </p>
          </div>

          <button
            onClick={fetchCloudRecords}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur border border-white/20 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Storage</span>
          </button>
        </div>
      </div>

      {/* Cloud Records Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Cloud Stored Ciphertext Objects ({records.length})</span>
          </span>
          <span className="text-xs text-slate-500 font-mono font-medium">Zero Plaintext Leakage Guarantee</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3">PHR ID & Name</th>
                <th className="py-2.5 px-3">Patient Owner</th>
                <th className="py-2.5 px-3">Encrypted Ciphertext Payload (HEX)</th>
                <th className="py-2.5 px-3">Encrypted Index Tokens</th>
                <th className="py-2.5 px-3">Access Tree Policy</th>
                <th className="py-2.5 px-3 text-right">Inspect Object</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {records.map(rec => (
                <tr key={rec.phrId} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{rec.recordName}</div>
                    <div className="text-[11px] font-mono text-sky-600 font-bold">{rec.phrId}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">
                    {rec.patientName}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-800 font-semibold">
                      {rec.encryptedPayloadSnippet}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                      <Tag className="w-3 h-3 text-sky-600" />
                      <span>{rec.encryptedIndexesCount} Blind Tokens</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <GitBranch className="w-3 h-3 text-emerald-600" />
                      <span>{rec.policyTree.operator || 'AND'} Tree</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedRecord(rec)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center space-x-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Inspect Raw</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Object Inspector Modal */}
      {selectedRecord && (
        <div className="bg-sky-50 p-6 rounded-xl border border-sky-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-sky-200 pb-3">
            <h3 className="text-sm font-bold text-sky-900 flex items-center space-x-2">
              <Eye className="w-4 h-4 text-sky-600" />
              <span>Raw Cloud Storage Metadata Object: {selectedRecord.phrId}</span>
            </h3>
            <button
              onClick={() => setSelectedRecord(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              ✕ Close
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-80">
            {JSON.stringify(selectedRecord, null, 2)}
          </div>
        </div>
      )}

    </div>
  );
}
