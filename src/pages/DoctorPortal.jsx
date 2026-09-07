import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Key, Lock, Unlock, FileText, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { searchPHR, decryptPHR, getUsers } from '../services/api';

export default function DoctorPortal() {
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('dr_bob');
  const [searchKeywordsInput, setSearchKeywordsInput] = useState('');
  
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [trapdoorMeta, setTrapdoorMeta] = useState(null);

  // Decryption State
  const [decryptedRecord, setDecryptedRecord] = useState(null);
  const [decryptionError, setDecryptionError] = useState(null);
  const [loadingDecryptId, setLoadingDecryptId] = useState(null);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await getUsers();
        if (res.data.success) {
          const docs = res.data.users.filter(u => u.role === 'DOCTOR' || u.role === 'RESEARCHER');
          setDoctorsList(docs);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDoctors();
  }, []);

  const currentDoctor = doctorsList.find(d => d.userId === selectedDoctorId);

  const handleExecuteSearch = async (e) => {
    e.preventDefault();
    if (!searchKeywordsInput.trim()) return;

    try {
      setLoadingSearch(true);
      setDecryptedRecord(null);
      setDecryptionError(null);

      const res = await searchPHR({
        doctorUserId: selectedDoctorId,
        searchKeywords: searchKeywordsInput
      });

      if (res.data.success) {
        setSearchResults(res.data.results);
        setTrapdoorMeta(res.data.trapdoorMeta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleDecryptRecord = async (phrId) => {
    try {
      setLoadingDecryptId(phrId);
      setDecryptionError(null);
      setDecryptedRecord(null);

      const res = await decryptPHR({
        phrId,
        doctorUserId: selectedDoctorId
      });

      if (res.data.success) {
        setDecryptedRecord(res.data);
      }
    } catch (err) {
      setDecryptionError(err.response?.data?.message || 'Decryption Failed: Access Denied.');
    } finally {
      setLoadingDecryptId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <div className="flex items-center space-x-2 text-sky-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Search className="w-4 h-4" />
            <span>Data User (Doctor / Researcher) Encrypted Search & Decryption</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Multi-Keyword Search Trapdoor Generation (TrapGen)</h1>
          <p className="text-sm text-slate-200 max-w-3xl mt-1">
            Instead of querying plaintext keywords, your identity-bound private key generates an **Encrypted Search Trapdoor** <code className="text-sky-300 bg-sky-950/60 px-1.5 py-0.5 rounded">T_W</code>. The Cloud evaluates hierarchical access policies and encrypted index matches without learning original health keywords or file contents.
          </p>
        </div>
      </div>

      {/* Doctor Identity Selector & Search Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          
          {/* Select Doctor Profile */}
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Key className="w-3.5 h-3.5 text-sky-600" />
              <span>Select Active Doctor / Researcher Identity</span>
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full light-input px-3 py-2 rounded-lg text-xs bg-white text-slate-900 font-bold"
            >
              {doctorsList.map(d => (
                <option key={d.userId} value={d.userId}>
                  {d.name} ({d.role}) — {d.attributes.join(', ')}
                </option>
              ))}
            </select>
          </div>

          {/* Search Keywords Input */}
          <div className="w-full md:w-2/3 flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Search Keywords (Comma Separated)</label>
              <input
                type="text"
                value={searchKeywordsInput}
                onChange={(e) => setSearchKeywordsInput(e.target.value)}
                placeholder="e.g. hypertension, cardiology, ecg"
                className="w-full light-input px-3 py-2 rounded-lg text-xs"
              />
            </div>
            
            <button
              onClick={handleExecuteSearch}
              disabled={loadingSearch}
              className="px-6 py-2.5 mt-5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center space-x-2 whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>{loadingSearch ? 'Generating Trapdoor...' : 'Generate Trapdoor & Search'}</span>
            </button>
          </div>

        </div>

        {/* Doctor Active Attributes Card */}
        {currentDoctor && (
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-600 font-semibold">Bound Attributes for {currentDoctor.name}:</span>
            <div className="flex flex-wrap gap-1">
              {currentDoctor.attributes.map(att => (
                <span key={att} className="px-2 py-0.5 text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 rounded font-semibold">
                  {att}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Generated Trapdoor Metadata Display */}
      {trapdoorMeta && (
        <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-sky-900">
            <span className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-sky-600" />
              <span>Encrypted Trapdoor Token (T_W) Sent to Cloud</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Bound to r_ID factor</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
            <div className="p-2.5 rounded bg-white border border-sky-200">
              <span className="text-slate-500 block text-[10px] font-sans font-semibold">T0 Component:</span>
              <span className="text-sky-700 font-semibold">{trapdoorMeta.T0}</span>
            </div>
            <div className="p-2.5 rounded bg-white border border-sky-200">
              <span className="text-slate-500 block text-[10px] font-sans font-semibold">T1 Trapdoor Component:</span>
              <span className="text-sky-700 font-semibold">{trapdoorMeta.T1}</span>
            </div>
            <div className="p-2.5 rounded bg-white border border-sky-200">
              <span className="text-slate-500 block text-[10px] font-sans font-semibold">Trapdoor Randomness r_trap:</span>
              <span className="text-slate-700 font-semibold">{trapdoorMeta.r_trap}</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Grid */}
      {searchResults && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Cloud Search Results ({searchResults.length})</span>
            <span className="text-xs text-slate-500 font-normal">Honest-but-Curious Cloud Execution</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map(res => (
              <div
                key={res.phrId}
                className={`p-5 rounded-xl border transition bg-white shadow-sm ${
                  res.authorized && res.matched
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{res.recordName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Patient: {res.patientName} (<code className="font-mono text-sky-700 font-bold">{res.phrId}</code>)</p>
                  </div>
                  {res.authorized ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Policy Passed</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>Access Denied</span>
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-medium">Keyword Match:</span>
                    {res.matched ? (
                      <span className="text-emerald-700 font-bold">{res.matchedCount} Keywords Matched ({res.matchedKeywords.join(', ')})</span>
                    ) : (
                      <span className="text-slate-400">No matching index tokens</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Cloud Search Time:</span>
                    </span>
                    <span className="font-mono text-slate-700 font-bold">{res.searchTimeMs} ms</span>
                  </div>

                  {res.reason && (
                    <div className="p-2 rounded.5 bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                      {res.reason}
                    </div>
                  )}

                  {res.authorized && res.matched && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleDecryptRecord(res.phrId)}
                        disabled={loadingDecryptId === res.phrId}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center space-x-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>{loadingDecryptId === res.phrId ? 'Decrypting...' : 'Decrypt Record (Dec)'}</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decrypted Payload Viewer Modal / Card */}
      {decryptedRecord && (
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <h3 className="text-base font-bold text-emerald-900 flex items-center space-x-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              <span>Decrypted Personal Health Record Payload</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-800">{decryptedRecord.recordName}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(JSON.parse(decryptedRecord.decryptedPayload), null, 2)}
          </div>
        </div>
      )}

      {decryptionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{decryptionError}</span>
        </div>
      )}

    </div>
  );
}
