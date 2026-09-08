import React, { useState, useEffect, useRef } from 'react';
import { Lock, FileText, Plus, Trash2, Tag, GitBranch, Upload, ShieldCheck, CheckCircle, ShieldAlert, History, Eye, Unlock, RotateCcw, Sparkles, Check, FileImage, Paperclip, X, Image, FileType } from 'lucide-react';
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

  // File upload mode state
  const [uploadMode, setUploadMode] = useState('text'); // 'text' | 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);  // base64 data URL for preview
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

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

  // File selection handler — reads file as Base64 DataURL
  const handleFileSelect = (file) => {
    if (!file) return;
    const maxSize = 10 * 1024 * 1024; // 10 MB limit
    if (file.size > maxSize) {
      alert('File too large. Maximum allowed size is 10 MB.');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target.result); // base64 data URL
    };
    reader.readAsDataURL(file);
    // Auto-fill record name from filename if empty
    if (!recordName) {
      setRecordName(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleEncryptAndUpload = async (e) => {
    e.preventDefault();

    // Validate based on mode
    if (uploadMode === 'text' && !payloadText) return;
    if (uploadMode === 'file' && !selectedFile && !filePreview) return;
    if (selectedPolicyAttributes.length === 0) return;

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

    // Determine payload, fileType, and originalFileName
    let finalPayload = payloadText;
    let fileType = 'text/plain';
    let originalFileName = null;

    if (uploadMode === 'file' && filePreview && selectedFile) {
      finalPayload = filePreview;           // Base64 DataURL string
      fileType = selectedFile.type || 'application/octet-stream';
      originalFileName = selectedFile.name;
    }

    try {
      setLoading(true);
      const res = await uploadPHR({
        recordName: recordName || `${category} Diagnostic Health Record`,
        category,
        patientId: activeUserId,
        payloadText: finalPayload,
        keywords,
        policyTree,
        fileType,
        originalFileName
      });

      if (res.data.success) {
        setResult(res.data);
        setSelectedFile(null);
        setFilePreview(null);
        if (uploadMode === 'file' && fileInputRef.current) fileInputRef.current.value = '';
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
      <div className="bg-gradient-to-r from-blue-950 via-sky-900 to-slate-900 p-6 sm:p-7 rounded-2xl text-white shadow-xl border border-sky-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="flex items-center space-x-2 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <Lock className="w-4 h-4 text-sky-400" />
            <span>Data Owner (Patient) Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            PHR Confidentiality, Category Selection & Policy Revocation
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            You own your Personal Health Records. You specify record categories, construct hierarchical attribute access policies, index multi-keywords, view access logs, and can **revoke sharing policies** at any time with immediate effect.
          </p>
        </div>
      </div>

      {result && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-2 shadow-sm animate-fadeIn">
          <div className="flex items-center space-x-2 font-bold text-emerald-800 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>PHR Encrypted & Stored in Cloud Vault Successfully!</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono">
            <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
              <span className="text-slate-500 text-[10px] block font-sans font-semibold">PHR ID:</span>
              <span className="font-bold text-emerald-700">{result.phrId}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
              <span className="text-slate-500 text-[10px] block font-sans font-semibold">Category:</span>
              <span className="font-bold text-slate-800 font-sans">{result.category}</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-emerald-200 font-mono text-[11px] text-slate-700">
            <span className="text-slate-500 font-sans font-semibold text-[10px] block">Ciphertext Payload Snippet:</span>
            <span className="truncate block font-semibold text-slate-800">{result.encryptedPayloadSnippet}</span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: PHR Record Payload & Multi-Keyword Tagger */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Record Details & Payload Editor */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-3 border-b border-slate-100">
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
                  className="w-full light-input px-3.5 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Record Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full light-input px-3.5 py-2.5 rounded-xl text-xs bg-white text-slate-900 font-bold focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Emergency Care">Emergency Care</option>
                </select>
              </div>
            </div>

            {/* Upload Mode Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1 gap-1">
              <button
                type="button"
                onClick={() => setUploadMode('text')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition ${
                  uploadMode === 'text' ? 'bg-white text-sky-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text / JSON</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition ${
                  uploadMode === 'file' ? 'bg-white text-sky-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>File Upload</span>
              </button>
            </div>

            {uploadMode === 'text' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Original Health Record Data (Plaintext JSON/Text)</label>
                <textarea
                  rows={7}
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  placeholder="Enter sensitive health diagnosis data here..."
                  className="w-full light-input p-3.5 rounded-xl text-xs font-mono text-slate-800 bg-slate-50/80 focus:bg-white focus:ring-2 focus:ring-sky-500/20 leading-relaxed"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Medical File <span className="text-slate-400 font-normal">(JPEG, PNG, PDF, DICOM, DOCX — max 10 MB)</span>
                </label>

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-sky-400 bg-sky-50'
                      : selectedFile
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-300 bg-slate-50 hover:border-sky-400 hover:bg-sky-50/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.dcm,.doc,.docx,text/plain"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />

                  {selectedFile ? (
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div className="font-bold text-emerald-800 text-sm">{selectedFile.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {selectedFile.type} · {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFilePreview(null); }}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center space-x-1 mx-auto mt-1"
                      >
                        <X className="w-3.5 h-3.5" /><span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2 pointer-events-none">
                      <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto">
                        <FileImage className="w-7 h-7 text-sky-500" />
                      </div>
                      <div className="font-semibold text-slate-700 text-sm">Drag & drop or click to select</div>
                      <div className="text-[11px] text-slate-400">JPEG · PNG · PDF · DICOM · DOCX · TXT</div>
                    </div>
                  )}
                </div>

                {/* File Preview */}
                {filePreview && selectedFile && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                    <div className="px-3 py-2 bg-slate-900 text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-2">
                      <Eye className="w-3 h-3" />
                      <span>File Preview (Pre-Encryption)</span>
                    </div>
                    {selectedFile.type.startsWith('image/') ? (
                      <img src={filePreview} alt="preview" className="max-h-48 w-full object-contain p-2" />
                    ) : selectedFile.type === 'application/pdf' ? (
                      <div className="p-3 text-slate-400 text-xs text-center">
                        <FileText className="w-10 h-10 mx-auto mb-1 text-rose-400" />
                        PDF file ready for encryption · {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    ) : (
                      <div className="p-3 text-slate-400 text-xs text-center">
                        <Paperclip className="w-10 h-10 mx-auto mb-1 text-sky-400" />
                        {selectedFile.name} ready for encryption
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Multi-Keyword Index Builder */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-3 border-b border-slate-100">
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
                className="flex-1 light-input px-3.5 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-1 shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tag</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {keywords.map(kw => (
                <span
                  key={kw}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-sky-50 text-sky-800 border border-sky-200 font-semibold shadow-2xs"
                >
                  <span>#{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-sky-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Patient's Own Encrypted PHRs List & Revocation Manager */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                My Uploaded PHR Records ({myRecords.length})
              </h3>
              <span className="text-xs text-slate-500 font-normal">Manage Sharing & Revocation</span>
            </div>

            <div className="space-y-3">
              {myRecords.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                  No PHR records uploaded yet. Encrypt your first record above.
                </div>
              ) : (
                myRecords.map(rec => (
                  <div key={rec.phrId} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{rec.recordName}</div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                        <span className="text-sky-600 font-bold">{rec.phrId}</span> | Category: <strong className="text-slate-700">{rec.category}</strong>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {rec.revoked ? (
                        <span className="px-3 py-1.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-xl font-bold text-[11px]">
                          Sharing Revoked
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRevoke(rec.phrId)}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                          <span>Revoke Sharing</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDecryptOwnRecord(rec.phrId)}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center space-x-1.5 active:scale-95"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Decrypt</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Hierarchical Policy Builder & Access History */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-3 border-b border-slate-100">
              <GitBranch className="w-4 h-4 text-emerald-600" />
              <span>3. Hierarchical Access Control Policy (T)</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Root Node Logic Operator</label>
              <div className="grid grid-cols-3 gap-2">
                {['AND', 'OR', 'THRESHOLD'].map(op => (
                  <button
                    type="button"
                    key={op}
                    onClick={() => setTreeOperator(op)}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition ${
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
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span>Threshold (k of n Required):</span>
                  <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                    {treeThreshold} of {selectedPolicyAttributes.length}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={Math.max(1, selectedPolicyAttributes.length)}
                  value={treeThreshold}
                  onChange={(e) => setTreeThreshold(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Required Subtree Attributes</label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-50/80 border border-slate-200">
                {attributes.map((attr, idx) => {
                  const isSelected = selectedPolicyAttributes.includes(attr);
                  return (
                    <button
                      type="button"
                      key={`pol_attr_${attr}_${idx}`}
                      onClick={() => togglePolicyAttribute(attr)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white border border-emerald-600 font-bold shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{attr}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Access Policy Structure Visualization */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 font-mono text-white shadow-inner">
              <div className="text-slate-400 text-[10px] font-sans font-bold uppercase tracking-wider">Policy Tree Preview:</div>
              <div className="text-emerald-400 font-bold text-xs">
                ROOT [{treeOperator === 'THRESHOLD' ? `${treeThreshold}-of-${selectedPolicyAttributes.length}` : treeOperator}]
              </div>
              {selectedPolicyAttributes.map((attr, idx) => (
                <div key={attr} className="pl-4 text-slate-200 border-l border-slate-700/80">
                  ├── LEAF {idx + 1}: <span className="text-sky-300 font-semibold">{attr}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleEncryptAndUpload}
              disabled={loading || selectedPolicyAttributes.length === 0 || (uploadMode === 'text' && !payloadText) || (uploadMode === 'file' && !selectedFile)}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? 'Encrypting & Building Indexes...' : uploadMode === 'file' ? 'Encrypt File & Upload to Cloud' : 'Encrypt PHR & Upload to Cloud'}</span>
            </button>

          </div>

          {/* Patient Activity & Access History */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-3 border-b border-slate-100">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Record Access History Log</span>
            </h3>

            <div className="space-y-2 text-xs max-h-56 overflow-y-auto">
              {userHistoryLogs.length === 0 ? (
                <div className="text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">
                  No access history recorded yet.
                </div>
              ) : (
                userHistoryLogs.map((log, idx) => (
                  <div key={log.id || `hist_${idx}`} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
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
              <button
                onClick={() => setDecryptedRecord(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Smart Format Renderer based on fileType */}
          {(() => {
            const payload = decryptedRecord.decryptedPayload || '';
            const ft = decryptedRecord.fileType || 'text/plain';

            // Image files (JPEG, PNG, GIF, WebP, BMP)
            if (ft.startsWith('image/') || payload.startsWith('data:image/')) {
              const src = payload.startsWith('data:') ? payload : `data:${ft};base64,${payload}`;
              return (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Decrypted Image File</div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 p-3 text-center">
                    <img
                      src={src}
                      alt={decryptedRecord.originalFileName || decryptedRecord.recordName}
                      className="max-h-96 max-w-full mx-auto rounded-lg shadow-lg object-contain"
                    />
                  </div>
                  {decryptedRecord.originalFileName && (
                    <div className="text-[11px] text-slate-500 text-center font-mono">{decryptedRecord.originalFileName}</div>
                  )}
                  <a
                    href={src}
                    download={decryptedRecord.originalFileName || 'decrypted_image'}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
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
                  <iframe
                    src={src}
                    title={decryptedRecord.originalFileName || 'PHR PDF'}
                    className="w-full h-96 rounded-xl border border-slate-200"
                  />
                  <a
                    href={src}
                    download={decryptedRecord.originalFileName || 'decrypted_document.pdf'}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 rotate-180" />
                    <span>Download PDF</span>
                  </a>
                </div>
              );
            }

            // Other binary files (DOCX, DICOM, etc.)
            if (payload.startsWith('data:') && !ft.startsWith('text/')) {
              return (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Decrypted File</div>
                  <div className="p-6 rounded-xl bg-slate-100 border border-slate-200 text-center space-y-3">
                    <Paperclip className="w-12 h-12 mx-auto text-sky-500" />
                    <div className="font-bold text-slate-800">{decryptedRecord.originalFileName || 'Encrypted File'}</div>
                    <div className="text-xs text-slate-500">{ft}</div>
                    <a
                      href={payload}
                      download={decryptedRecord.originalFileName || 'decrypted_file'}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
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

    </div>
  );
}
