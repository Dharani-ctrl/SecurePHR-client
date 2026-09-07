import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Zap, TrendingUp, BarChart2, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { getPerformanceBenchmarks } from '../services/api';

export default function PerformanceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getPerformanceBenchmarks();
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-sky-900 to-slate-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <div className="flex items-center space-x-2 text-sky-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Research Experimental Performance & Benchmarking</span>
          </div>
          <h1 className="text-2xl font-bold text-white">HABKS-CR Performance Evaluation & Scheme Comparisons</h1>
          <p className="text-sm text-slate-200 max-w-3xl mt-1">
            Comparative performance metrics of HABKS-CR evaluated against **ABKS-HD-I, FAKS, and LPCR** schemes. HABKS-CR achieves **near-constant search trapdoor generation time** even as keyword count scales from 1 to 20+.
          </p>
        </div>
      </div>

      {/* Environment Spec Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
            <span className="text-slate-500 font-medium block mb-1">Test Platform OS</span>
            <span className="font-bold text-slate-900 text-sm">{data.environment.os}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
            <span className="text-slate-500 font-medium block mb-1">CPU & Hardware</span>
            <span className="font-bold text-sky-700 text-sm">{data.environment.cpu}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
            <span className="text-slate-500 font-medium block mb-1">Pairing Curve</span>
            <span className="font-bold text-emerald-700 text-sm">{data.environment.curve}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
            <span className="text-slate-500 font-medium block mb-1">Benchmark Runs</span>
            <span className="font-bold text-indigo-700 text-sm">{data.environment.runsAveraged} Executions Averaged</span>
          </div>
        </div>
      )}

      {/* Recharts Graphs Grid */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Trapdoor Generation Time Graph */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-sky-600" />
                  <span>Search Trapdoor Generation Time (ms)</span>
                </h3>
                <p className="text-xs text-slate-500">HABKS-CR TrapGen cost remains stable as keywords grow</p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 rounded-full">
                Constant Complexity O(1)
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trapdoorTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="keywordCount" stroke="#64748b" fontSize={11} label={{ value: 'Search Keyword Count', position: 'insideBottom', offset: -5, fill: '#475569' }} />
                  <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#475569' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  
                  <Line type="monotone" dataKey="HABKS_CR" name="HABKS-CR (Proposed)" stroke="#0284c7" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="ABKS_HD_I" name="ABKS-HD-I" stroke="#2563eb" strokeWidth={1.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="FAKS" name="FAKS" stroke="#d97706" strokeWidth={1.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="LPCR" name="LPCR" stroke="#e11d48" strokeWidth={1.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cloud Search Execution Time Graph */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Cloud Search Time Evaluation (ms)</span>
                </h3>
                <p className="text-xs text-slate-500">Encrypted index matching & policy evaluation speed</p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                High Throughput
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.searchTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="keywordCount" stroke="#64748b" fontSize={11} label={{ value: 'Search Keyword Count', position: 'insideBottom', offset: -5, fill: '#475569' }} />
                  <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#475569' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  
                  <Line type="monotone" dataKey="HABKS_CR" name="HABKS-CR (Proposed)" stroke="#059669" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="ABKS_HD_I" name="ABKS-HD-I" stroke="#4f46e5" strokeWidth={1.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="FAKS" name="FAKS" stroke="#7c3aed" strokeWidth={1.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="LPCR" name="LPCR" stroke="#db2777" strokeWidth={1.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Paper Summary Highlights Box */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
          <CheckCircle2 className="w-4 h-4 text-sky-600" />
          <span>HABKS-CR Comparative Advantages</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-sky-700 mb-1">1. Trapdoor Efficiency</div>
            <p className="text-slate-600">Trapdoor generation computational overhead does not scale linearly with search keywords, offloading key verification overhead.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-emerald-700 mb-1">2. Hierarchical Policy Reuse</div>
            <p className="text-slate-600">Sub-policies (e.g. Doctor AND Cardiology) are aggregated into hierarchical access trees, eliminating redundant index encryption.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-rose-700 mb-1">3. Collusion Protection</div>
            <p className="text-slate-600">Provides formal CCA/CKA security guarantees against honest-but-curious cloud servers and malicious colluding data users.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
