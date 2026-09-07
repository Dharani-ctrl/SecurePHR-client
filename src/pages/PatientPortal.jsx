import React, { useState, useEffect } from 'react';
import { Lock, FileText, Plus, Trash2, Tag, GitBranch, Upload, ShieldCheck, CheckCircle, ShieldAlert, History, Eye, Unlock, RotateCcw } from 'lucide-react';
import { uploadPHR, getSystemParameters, getUsers, getCloudPHRList, revokePHRSharing, decryptPHR, getUserHistory } from '../services/api';

export default function PatientPortal({ onPHRUploaded, activeUserId = 'patient_john' }) {
  const [recordName, setRecordName] = useState('');
  const [category, setCategory] = useState('Cardiology');
  const [payloadText, setPayloadText] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [attributes, setAttributes] = useState([]);
  
  // Hierarchical Policy Tree Builder state
  const [treeOperator, setTreeOperator] = useState('AND');
  const [treeThreshold, setTreeThreshold] = useState(3);
  const [selectedPolicyAttributes, setSelectedPolicyAttributes] = useState([
    'Role:Doctor',
    'Dept:Cardiology',
    'Hosp:KMCH'
  ]);

  const [myRecords, setMyRecords] = useState([]);
  const [userHistoryLogs, setUserHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [decryptedRecord, setDecryptedRecord] = useState(null);

  const loadData = async () => {
    try {
      const [resParams, resMyRecords, resHistory] = await Promise.all([
        getSystemParameters(),
        getCloudPHRList(activeUserId),
        getUserHistory(activeUserId)
      ]);
      if (resParams.data.success) setAttributes(resParams.data.attributes);
      if (resMyRecords.data.success) setMyRecords(resMyRecords.data.records);
      if (resHistory.data.success) setUserHistoryLogs(resHistory.data.history);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeUserId]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim().toLowerCase())) {
      setKeywords([...keywords, keywordInput.trim().toLowerCase()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kw) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const togglePolicyAttribute = (attr) => {
    if (selectedPolicyAttributes.includes(attr)) {
      setSelectedPolicyAttributes(selectedPolicyAttributes.filter(a => a !== attr));
    } else {
      setSelectedPolicyAttributes([...selectedPolicyAttributes, attr]);
    }
  };

  const handleEncryptAndUpload = async (e) => {
    e.preventDefault();
    if (!payloadText || selectedPolicyAttributes.length === 0) return;

    // Build Policy Tree Structure
    const policyTree = {
      type: 'GATE',
      operator: treeOperator,
      threshold: treeOperator === 'THRESHOLD' ? treeThreshold : (treeOperator === 'AND' ? selectedPolicyAttributes.length : 1),
      children: selectedPolicyAttributes.map(attr => ({
        type: 'LEAF',
        attribute: attr
      }))
    };

    try {
      setLoading(true);
      const res = await uploadPHR({
        recordName: recordName || `${category} Diagnostic Health Record`,
        category,
        patientId: activeUserId,
        payloadText,
        keywords,
        policyTree
      });

      if (res.data.success) {
        setResult(res.data);
        loadData();
        if (onPHRUploaded) onPHRUploaded();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (phrId) => {
    try {
      const res = await revokePHRSharing({ phrId, patientId: activeUserId });
      if (res.data.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecryptOwnRecord = async (phrId) => {
    try {
      const res = await decryptPHR({ phrId, doctorUserId: activeUserId });
      if (res.data.success) {
        setDecryptedRecord(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-sky-900 to-slate-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <div className="flex items-center space-x-2 text-sky-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4" />
            <span>Data Owner (Patient) Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-white">PHR Confidentiality, Category Selection & Policy Revocation</h1>
          <p className="text-sm text-slate-200 max-w-3xl mt-1">
            You own your Personal Health Records. You specify record categories, construct hierarchical attribute access policies, index multi-keywords, view access logs, and can **revoke sharing policies** at any time.
          </p>
        </div>
      </div>

      {result && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-emerald-700 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>PHR Encrypted & Stored in Cloud Vault Successfully!</span>
          </div>
          <p>PHR ID: <code className="font-mono text-emerald-800 font-bold">{result.phrId}</code></p>
          <p>Category: <strong className="text-slate-800">{result.category}</strong></p>
          <p>Ciphertext Payload Snippet: <code className="font-mono text-slate-700">{result.encryptedPayloadSnippet}</code></p>
          <p>Encrypted Keyword Index Count: <strong>{result.keywordsCount} Tokens</strong></p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: PHR Record Payload & Multi-Keyword Tagger */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Record Details & Payload Editor */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>1. Medical Record Payload & Metadata</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Record Name / Title</label>
                <input
                  type="text"
                  value={recordName}
                  onChange={(e) => setRecordName(e.target.value)}
                  placeholder="e.g. Cardiology Evaluation Report"
                  className="w-full light-input px-3 py-2 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Record Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full light-input px-3 py-2 rounded-lg text-xs bg-white text-slate-900 font-bold"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Emergency Care">Emergency Care</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Original Health Record Data (Plaintext JSON/Text)</label>
              <textarea
                rows={8}
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                className="w-full light-input p-3 rounded-lg text-xs font-mono text-slate-800 bg-slate-50"
              />
            </div>
          </div>

          {/* Multi-Keyword Index Builder */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Tag className="w-4 h-4 text-sky-600" />
              <span>2. Multi-Keyword Encrypted Search Indexing</span>
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                placeholder="Enter search keyword (e.g. hypertension)"
                className="flex-1 light-input px-3 py-2 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tag</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {keywords.map(kw => (
                <span
                  key={kw}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono bg-sky-50 text-sky-700 border border-sky-200 font-medium"
                >
                  <span>#{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-sky-500 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Patient's Own Encrypted PHRs List & Revocation Manager */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between pb-2 border-b border-slate-100">
              <span>My Uploaded PHR Records ({myRecords.length})</span>
              <span className="text-xs text-slate-500 font-normal">Manage Sharing & Revocation</span>
            </h3>

            <div className="space-y-3">
              {myRecords.map(rec => (
                <div key={rec.phrId} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{rec.recordName}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{rec.phrId} | Category: <strong className="text-slate-700">{rec.category}</strong></div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {rec.revoked ? (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full font-bold text-[10px]">
                        Sharing Revoked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRevoke(rec.phrId)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                        <span>Revoke Sharing</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDecryptOwnRecord(rec.phrId)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs shadow-sm transition flex items-center space-x-1"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Decrypt Payload</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Hierarchical Policy Builder & Access History */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
              <GitBranch className="w-4 h-4 text-emerald-600" />
              <span>3. Hierarchical Access Control Policy (T)</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Root Node Logic Operator</label>
              <div className="grid grid-cols-3 gap-2">
                {['AND', 'OR', 'THRESHOLD'].map(op => (
                  <button
                    type="button"
                    key={op}
                    onClick={() => setTreeOperator(op)}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      treeOperator === op
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            {treeOperator === 'THRESHOLD' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Threshold (k of n Required): <strong className="text-emerald-700">{treeThreshold} of {selectedPolicyAttributes.length}</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={Math.max(1, selectedPolicyAttributes.length)}
                  value={treeThreshold}
                  onChange={(e) => setTreeThreshold(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Required Subtree Attributes</label>
              <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                {attributes.map(attr => {
                  const isSelected = selectedPolicyAttributes.includes(attr);
                  return (
                    <button
                      type="button"
                      key={attr}
                      onClick={() => togglePolicyAttribute(attr)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white border border-emerald-600 font-semibold shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {attr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Access Policy Structure Visualization */}
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5 font-mono text-white">
              <div className="text-slate-400 text-[11px] font-sans font-semibold uppercase">Policy Tree Preview:</div>
              <div className="text-emerald-400 font-bold">
                ROOT [{treeOperator === 'THRESHOLD' ? `${treeThreshold}-of-${selectedPolicyAttributes.length}` : treeOperator}]
              </div>
              {selectedPolicyAttributes.map((attr, idx) => (
                <div key={attr} className="pl-4 text-slate-200 border-l border-slate-700">
                  ├── LEAF {idx + 1}: <span className="text-sky-300 font-semibold">{attr}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleEncryptAndUpload}
              disabled={loading || selectedPolicyAttributes.length === 0}
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? 'Encrypting Payload & Building Indexes...' : 'Encrypt PHR & Upload to Cloud'}</span>
            </button>

          </div>

          {/* Patient Activity & Access History */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Record Access History Log</span>
            </h3>

            <div className="space-y-2 text-xs max-h-56 overflow-y-auto">
              {userHistoryLogs.length === 0 ? (
                <div className="text-slate-400 text-center py-4">No access history recorded yet.</div>
              ) : (
                userHistoryLogs.map(log => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-800">{log.action}</div>
                    <div className="text-slate-600 text-[11px]">{log.details}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Decrypted Payload Viewer Card */}
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

    </div>
  );
}
