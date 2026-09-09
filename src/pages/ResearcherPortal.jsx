import React, { useState, useEffect } from 'react';
import { Search, Key, Lock, Unlock, FileText, CheckCircle, XCircle, Clock, Eye, Microscope, Award, Paperclip, X, Upload } from 'lucide-react';
import { searchPHR, decryptPHR, getUsers, getUserHistory } from '../services/api';

export default function ResearcherPortal({ activeUserId = 'researcher_david' }) {
  const [researchersList, setResearchersList] = useState([]);
  const [selectedResearcherId, setSelectedResearcherId] = useState(activeUserId);
  const [searchKeywordsInput, setSearchKeywordsInput] = useState('');
  
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [trapdoorMeta, setTrapdoorMeta] = useState(null);

  // Decryption State
  const [decryptedRecord, setDecryptedRecord] = useState(null);
  const [decryptionError, setDecryptionError] = useState(null);
  const [loadingDecryptId, setLoadingDecryptId] = useState(null);
  const [myHistory, setMyHistory] = useState([]);

  const loadData = async () => {
    try {
      const [resUsers, resHist] = await Promise.all([
        getUsers(),
        getUserHistory(selectedResearcherId)
      ]);
      if (resUsers.data.success) {
        const resList = resUsers.data.users.filter(u => u.role === 'RESEARCHER');
        setResearchersList(resList);
      }
      if (resHist.data.success) {
        setMyHistory(resHist.data.history);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedResearcherId]);

  const currentResearcher = researchersList.find(r => r.userId === selectedResearcherId) || {
    name: 'Dr. David Kim',
    userId: 'researcher_david',
    organization: 'Stanford University',
    attributes: ['Role:Researcher', 'Hosp:KMCH', 'Status:Approved']
  };

  const handleExecuteSearch = async (e) => {
    e.preventDefault();
    if (!searchKeywordsInput.trim()) return;

    try {
      setLoadingSearch(true);
      setDecryptedRecord(null);
      setDecryptionError(null);

      const res = await searchPHR({
        doctorUserId: selectedResearcherId,
        searchKeywords: searchKeywordsInput
      });

      if (res.data.success) {
        setSearchResults(res.data.results);
        setTrapdoorMeta(res.data.trapdoorMeta);
        loadData();
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
        doctorUserId: selectedResearcherId
      });

      if (res.data.success) {
        setDecryptedRecord(res.data);
        loadData();
      }
    } catch (err) {
      setDecryptionError(err.response?.data?.message || 'Decryption Failed: Your researcher attributes do not satisfy the record policy.');
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
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Microscope className="w-4 h-4" />
            <span>Data User (Approved Academic Researcher) Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Multi-Keyword Research Dataset Search & Access</h1>
          <p className="text-sm text-slate-200 max-w-3xl mt-1">
            Authorized clinical researchers use identity-bound keys (<code className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded font-mono">SK_Researcher</code>) with attributes like <code className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded font-mono">role:researcher</code>, <code className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded font-mono">organization:stanford</code>, and <code className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded font-mono">researchStatus:approved</code> to query encrypted healthcare datasets.
          </p>
        </div>
      </div>

      {/* Researcher Identity Selector & Search Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          
          {/* Select Researcher Profile */}
          <div className="w-full lg:w-1/3 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>Select Active Approved Researcher</span>
            </label>
            <select
              value={selectedResearcherId}
              onChange={(e) => setSelectedResearcherId(e.target.value)}
              className="w-full light-input px-3 py-2 rounded-lg text-xs bg-white text-slate-900 font-bold focus:ring-2 focus:ring-purple-500/20"
            >
              {researchersList.map(r => (
                <option key={r.userId} value={r.userId}>
                  {r.name} ({r.organization || 'University'}) — {r.userId}
                </option>
              ))}
            </select>
          </div>

          {/* Search Keywords Input */}
          <div className="w-full lg:w-2/3 flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Search Keywords (Comma Separated)</label>
              <input
                type="text"
                value={searchKeywordsInput}
                onChange={(e) => setSearchKeywordsInput(e.target.value)}
                placeholder="e.g. hypertension, cardiology, kmch"
                className="w-full light-input px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            
            <button
              onClick={handleExecuteSearch}
              disabled={loadingSearch}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center space-x-2 whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loadingSearch ? 'Querying Datasets...' : 'Search Encrypted Datasets'}</span>
            </button>
          </div>

        </div>

        {/* Researcher Credentials */}
        {currentResearcher && (
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-600 font-semibold">Researcher Credentials & Attributes for {currentResearcher.name}:</span>
            <div className="flex flex-wrap gap-1">
              {currentResearcher.attributes.map(att => (
                <span key={att} className="px-2 py-0.5 text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 rounded font-semibold">
                  {att}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Generated Trapdoor Metadata Display */}
      {trapdoorMeta && (
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-purple-900">
            <span className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>Encrypted Research Trapdoor Token (T_W) Sent to Cloud</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Bound to r_ID factor</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
            <div className="p-2.5 rounded bg-white border border-purple-200">
              <span className="text-slate-500 block text-[10px] font-sans font-semibold">T0 Component:</span>
              <span className="text-purple-700 font-semibold">{trapdoorMeta.T0}</span>
            </div>
            <div className="p-2.5 rounded bg-white border border-purple-200">
              <span className="text-slate-500 block text-[10px] font-sans font-semibold">T1 Trapdoor Component:</span>
              <span className="text-purple-700 font-semibold">{trapdoorMeta.T1}</span>
            </div>
            <div className="p-2.5 rounded bg-white border border-purple-200">
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
            <span>Research Dataset Results ({searchResults.length})</span>
            <span className="text-xs text-slate-500 font-normal">Encrypted Policy Evaluation</span>
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
                    <p className="text-xs text-slate-500 mt-0.5">Patient Owner: {res.patientName} (<code className="font-mono text-purple-700 font-bold">{res.phrId}</code>)</p>
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
                    <span className="font-medium">Keyword Index Match:</span>
                    {res.matched ? (
                      <span className="text-emerald-700 font-bold">{res.matchedCount} Keywords Matched ({res.matchedKeywords.join(', ')})</span>
                    ) : (
                      <span className="text-slate-400">No matching index tokens</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Cloud Evaluation Time:</span>
                    </span>
                    <span className="font-mono text-slate-700 font-bold">{res.searchTimeMs} ms</span>
                  </div>

                  {res.reason && (
                    <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                      {res.reason}
                    </div>
                  )}

                  {res.authorized && res.matched && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleDecryptRecord(res.phrId)}
                        disabled={loadingDecryptId === res.phrId}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center space-x-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>{loadingDecryptId === res.phrId ? 'Decrypting...' : 'Decrypt Research Record'}</span>
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
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-purple-200 pb-3">
            <h3 className="text-base font-bold text-purple-900 flex items-center space-x-2">
              <Unlock className="w-5 h-5 text-purple-600" />
              <span>Decrypted Research Dataset</span>
            </h3>
            <div className="flex items-center space-x-2">
              {decryptedRecord.fileType && decryptedRecord.fileType !== 'text/plain' && (
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 font-mono">
                  {decryptedRecord.fileType}
                </span>
              )}
              <span className="text-xs font-mono font-bold text-purple-800">{decryptedRecord.recordName}</span>
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
                  <div className="rounded-xl overflow-hidden border border-purple-200 bg-slate-950 p-3 text-center">
                    <img src={src} alt={decryptedRecord.originalFileName || decryptedRecord.recordName}
                      className="max-h-96 max-w-full mx-auto rounded-lg shadow-lg object-contain" />
                  </div>
                  {decryptedRecord.originalFileName && (
                    <div className="text-[11px] text-slate-500 text-center font-mono">{decryptedRecord.originalFileName}</div>
                  )}
                  <a href={src} download={decryptedRecord.originalFileName || 'decrypted_image'}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
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
                  <iframe src={src} title={decryptedRecord.originalFileName || 'Research PDF'}
                    className="w-full h-96 rounded-xl border border-purple-200" />
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
                  <div className="p-6 rounded-xl bg-purple-100 border border-purple-200 text-center space-y-3">
                    <Paperclip className="w-12 h-12 mx-auto text-purple-500" />
                    <div className="font-bold text-purple-900">{decryptedRecord.originalFileName || 'Research File'}</div>
                    <div className="text-xs text-slate-500">{ft}</div>
                    <a href={payload} download={decryptedRecord.originalFileName || 'decrypted_file'}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                      <Upload className="w-3.5 h-3.5 rotate-180" />
                      <span>Download File</span>
                    </a>
                  </div>
                </div>
              );
            }

            // Plain text / JSON fallback
            return (
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                {renderPayload(payload)}
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
}
