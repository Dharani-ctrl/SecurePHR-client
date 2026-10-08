import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Key, Lock, Unlock, FileText, CheckCircle, XCircle, Clock, Eye, Sparkles, Filter, Copy, Check, Paperclip, X, FileImage, Upload } from 'lucide-react';
import { searchPHR, decryptPHR, getUsers } from '../services/api';

export default function DoctorPortal() {
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('dr_arun');
  const [searchKeywordsInput, setSearchKeywordsInput] = useState('');
  
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [trapdoorMeta, setTrapdoorMeta] = useState(null);


  const [decryptedRecord, setDecryptedRecord] = useState(null);
  const [decryptionError, setDecryptionError] = useState(null);
  const [loadingDecryptId, setLoadingDecryptId] = useState(null);
  const [copiedTrapdoor, setCopiedTrapdoor] = useState(false);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await getUsers();
        if (res.data.success && res.data.users) {
          const docs = res.data.users.filter(u => u.role === 'DOCTOR');
          setDoctorsList(docs);
          if (docs.length > 0) {
            setSelectedDoctorId(docs[0].userId);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDoctors();
  }, []);

  const currentDoctor = doctorsList.find(d => d.userId === selectedDoctorId) || doctorsList[0];

  const handleCopyTrapdoor = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTrapdoor(true);
    setTimeout(() => setCopiedTrapdoor(false), 2000);
  };

  const handleExecuteSearch = async (e) => {
    e.preventDefault();
    if (!searchKeywordsInput.trim()) return;

    try {
      setLoadingSearch(true);
      setDecryptedRecord(null);
      setDecryptionError(null);

      const activeDoctorId = selectedDoctorId || (doctorsList[0] ? doctorsList[0].userId : 'dr_arun');

      const res = await searchPHR({
        doctorUserId: activeDoctorId,
        searchKeywords: searchKeywordsInput
      });

      if (res.data.success) {
        setSearchResults(res.data.results);
        setTrapdoorMeta(res.data.trapdoorMeta);
      }
    } catch (err) {
      console.error(err);
      setDecryptionError(err.response?.data?.message || 'Search execution failed');
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleDecryptRecord = async (phrId) => {
    try {
      setLoadingDecryptId(phrId);
      setDecryptionError(null);
      setDecryptedRecord(null);

      const activeDoctorId = selectedDoctorId || (doctorsList[0] ? doctorsList[0].userId : 'dr_arun');

      const res = await decryptPHR({
        phrId,
        doctorUserId: activeDoctorId
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

  const renderPayload = (payload) => {
    if (!payload) return '';
    if (typeof payload === 'object') {
      try {
        return JSON.stringify(payload, null, 2);
      } catch (e) {
        return String(payload);
      }
    }
    const str = String(payload).trim();
    if (str.startsWith('{') || str.startsWith('[')) {
      try {
        const parsed = JSON.parse(str);
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        return str;
      }
    }
    return str;
  };

  return (
    <div className="space-y-6">
      

      <div className="bg-gradient-to-r from-sky-950 via-indigo-950 to-slate-900 p-6 sm:p-7 rounded-2xl text-white shadow-xl border border-sky-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="flex items-center space-x-2 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <Search className="w-4 h-4 text-sky-400" />
            <span>Data User (Doctor / Researcher) Query Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Multi-Keyword Search Trapdoor Generation (TrapGen)
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            Instead of querying plaintext keywords, your identity-bound private key generates an **Encrypted Search Trapdoor** (<code className="text-sky-300 bg-sky-950/80 px-1.5 py-0.5 rounded font-mono text-[11px] border border-sky-800">T_W</code>). The Cloud evaluates hierarchical access policies and encrypted index matches without learning original health keywords or file contents.
          </p>
        </div>
      </div>

  
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          
  
          <div className="w-full lg:w-1/3 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center space-x-1">
              <Key className="w-3.5 h-3.5 text-sky-600" />
              <span>Select Active Doctor Identity</span>
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full light-input px-3.5 py-2.5 rounded-xl text-xs bg-white text-slate-900 font-bold focus:ring-2 focus:ring-sky-500/20"
            >
              {doctorsList.map(d => (
                <option key={d.userId} value={d.userId}>
                  {d.name} ({d.role}) — {d.attributes ? d.attributes.join(', ') : 'Active'}
                </option>
              ))}
            </select>
          </div>

     
          <div className="w-full lg:w-2/3 flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Search Keywords (Comma Separated)</label>
              <input
                type="text"
                value={searchKeywordsInput}
                onChange={(e) => setSearchKeywordsInput(e.target.value)}
                placeholder="e.g. hypertension, cardiology, ecg"
                className="w-full light-input px-3.5 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            
            <button
              onClick={handleExecuteSearch}
              disabled={loadingSearch}
              className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loadingSearch ? 'Generating Trapdoor...' : 'Generate Trapdoor & Search'}</span>
            </button>
          </div>

        </div>

        {currentDoctor && (
          <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-600 font-semibold">Bound Attributes for {currentDoctor.name}:</span>
            <div className="flex flex-wrap gap-1.5">
              {currentDoctor.attributes && currentDoctor.attributes.map(att => (
                <span key={att} className="px-2.5 py-1 text-[11px] font-mono bg-sky-50 text-sky-800 border border-sky-200 rounded-lg font-bold shadow-2xs">
                  {att}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Generated Trapdoor Metadata Display */}
      {trapdoorMeta && (
        <div className="bg-sky-50/90 p-5 rounded-2xl border border-sky-200 space-y-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center justify-between font-bold text-sky-950">
            <span className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-sky-600" />
              <span>Encrypted Trapdoor Token (T_W) Sent to Cloud</span>
            </span>
            <button
              onClick={() => handleCopyTrapdoor(JSON.stringify(trapdoorMeta))}
              className="text-sky-700 hover:text-sky-900 text-xs font-semibold flex items-center space-x-1"
            >
              {copiedTrapdoor ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTrapdoor ? 'Copied' : 'Copy Trapdoor JSON'}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
            <div className="p-3 rounded-xl bg-white border border-sky-200/80 shadow-2xs space-y-1">
              <span className="text-slate-500 block text-[10px] font-sans font-semibold">T0 Component:</span>
              <span className="text-sky-700 font-bold break-all">{trapdoorMeta.T0}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-sky-200/80 shadow-2xs space-y-1">
              <span className="text-slate-500 block text-[10px] font-sans font-semibold">T1 Trapdoor Component:</span>
              <span className="text-sky-700 font-bold break-all">{trapdoorMeta.T1}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-sky-200/80 shadow-2xs space-y-1">
              <span className="text-slate-500 block text-[10px] font-sans font-semibold">Randomness Factor r_trap:</span>
              <span className="text-slate-700 font-bold break-all">{trapdoorMeta.r_trap}</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Grid */}
      {searchResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Cloud Search Results ({searchResults.length})</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Honest-but-Curious Cloud Execution
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map(res => (
              <div
                key={res.phrId}
                className={`p-5 rounded-2xl border transition-all bg-white shadow-xs ${
                  res.authorized && res.matched
                    ? 'border-emerald-300/90 bg-emerald-50/20 hover:shadow-md'
                    : 'border-slate-200/90 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm text-slate-900">{res.recordName}</h4>
                    <p className="text-xs text-slate-500">
                      Patient: <span className="font-semibold text-slate-700">{res.patientName}</span> (<code className="font-mono text-sky-700 font-bold">{res.phrId}</code>)
                    </p>
                  </div>
                  
                  {res.authorized ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Policy Passed</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Access Denied</span>
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-semibold">Keyword Match Status:</span>
                    {res.matched ? (
                      <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {res.matchedCount} Keywords Matched ({res.matchedKeywords.join(', ')})
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">No matching index tokens</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cloud Search Execution Time:</span>
                    </span>
                    <span className="font-mono text-slate-700 font-bold">{res.searchTimeMs} ms</span>
                  </div>

                  {res.reason && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] leading-relaxed">
                      {res.reason}
                    </div>
                  )}

                  {res.authorized && res.matched && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleDecryptRecord(res.phrId)}
                        disabled={loadingDecryptId === res.phrId}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center space-x-1.5 active:scale-95"
                      >
                        <Unlock className="w-4 h-4" />
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

      {/* Decrypted Payload Viewer — Smart Format Renderer */}
      {decryptedRecord && (
        <div className="bg-emerald-50/90 p-6 rounded-2xl border border-emerald-200 space-y-4 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <h3 className="text-base font-bold text-emerald-950 flex items-center space-x-2">
              <Unlock className="w-5 h-5 text-emerald-600" />
              <span>Decrypted Personal Health Record</span>
            </h3>
            <div className="flex items-center space-x-2">
              {decryptedRecord.fileType && decryptedRecord.fileType !== 'text/plain' && (
                <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200 font-mono">
                  {decryptedRecord.fileType}
                </span>
              )}
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                {decryptedRecord.recordName}
              </span>
              <button onClick={() => setDecryptedRecord(null)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {(() => {
            const payload = decryptedRecord.decryptedPayload || '';
            const ft = decryptedRecord.fileType || 'text/plain';

            // Image files
            if (ft.startsWith('image/') || payload.startsWith('data:image/')) {
              const src = payload.startsWith('data:') ? payload : `data:${ft};base64,${payload}`;
              return (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Decrypted Image File</div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 p-3 text-center">
                    <img src={src} alt={decryptedRecord.originalFileName || decryptedRecord.recordName}
                      className="max-h-96 max-w-full mx-auto rounded-lg shadow-lg object-contain" />
                  </div>
                  {decryptedRecord.originalFileName && (
                    <div className="text-[11px] text-slate-500 text-center font-mono">{decryptedRecord.originalFileName}</div>
                  )}
                  <a href={src} download={decryptedRecord.originalFileName || 'decrypted_image'}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                    <Upload className="w-3.5 h-3.5 rotate-180" />
                    <span>Download Image</span>
                  </a>
                </div>
              );
            }

            // PDF files
            if (ft === 'application/pdf' || payload.startsWith('data:application/pdf')) {
              const src = payload.startsWith('data:') ? payload : `data:application/pdf;base64,${payload}`;
              return (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Decrypted PDF Document</div>
                  <iframe src={src} title={decryptedRecord.originalFileName || 'PHR PDF'}
                    className="w-full h-96 rounded-xl border border-slate-200" />
                  <a href={src} download={decryptedRecord.originalFileName || 'decrypted_document.pdf'}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                    <Upload className="w-3.5 h-3.5 rotate-180" />
                    <span>Download PDF</span>
                  </a>
                </div>
              );
            }

            // Other binary files
            if (payload.startsWith('data:') && !ft.startsWith('text/')) {
              return (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Decrypted File</div>
                  <div className="p-6 rounded-xl bg-slate-100 border border-slate-200 text-center space-y-3">
                    <Paperclip className="w-12 h-12 mx-auto text-sky-500" />
                    <div className="font-bold text-slate-800">{decryptedRecord.originalFileName || 'Encrypted File'}</div>
                    <div className="text-xs text-slate-500">{ft}</div>
                    <a href={payload} download={decryptedRecord.originalFileName || 'decrypted_file'}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                      <Upload className="w-3.5 h-3.5 rotate-180" />
                      <span>Download File</span>
                    </a>
                  </div>
                </div>
              );
            }

            // Plain text / JSON fallback
            return (
              <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {renderPayload(payload)}
              </div>
            );
          })()}
        </div>
      )}

      {decryptionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-fadeIn">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{decryptionError}</span>
        </div>
      )}

    </div>
  );
}
