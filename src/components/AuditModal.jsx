import React, { useState, useEffect } from 'react';
import { Activity, X, Shield, Clock } from 'lucide-react';
import { getAuditLogs } from '../services/api';

export default function AuditModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      async function loadLogs() {
        try {
          setLoading(true);
          const res = await getAuditLogs();
          if (res.data.success) {
            setLogs(res.data.logs);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      loadLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">HABKS-CR Cryptographic Audit Trail</h3>
              <p className="text-[11px] text-slate-500 font-medium">Real-time log of KeyGen, Encryption, Trapdoors, and Collusion Tests</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Log Timeline */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 font-mono text-xs">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading audit trail...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No logs found.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-sky-600 mt-1.5 flex-shrink-0"></div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-700">{log.action}</span>
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1 font-sans">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans font-medium">
                    Actor: <span className="text-slate-900 font-bold">{log.actor}</span>
                  </div>
                  <div className="text-[11px] text-slate-700 pt-0.5 leading-relaxed">
                    {log.details}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition"
          >
            Close Audit Log
          </button>
        </div>

      </div>
    </div>
  );
}
