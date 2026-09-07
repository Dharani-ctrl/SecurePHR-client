import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, AlertTriangle, CheckCircle2, XCircle, Users, Cpu, ArrowRight } from 'lucide-react';
import { simulateCollusion, getUsers } from '../services/api';

export default function CollusionLab() {
  const [usersList, setUsersList] = useState([]);
  const [userA_Id, setUserA_Id] = useState('dr_alice');
  const [userB_Id, setUserB_Id] = useState('researcher_david');
  
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await getUsers();
        if (res.data.success) {
          setUsersList(res.data.users);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadUsers();
  }, []);

  const handleSimulate = async () => {
    try {
      setLoading(true);
      const res = await simulateCollusion({ userA_Id, userB_Id });
      if (res.data.success) {
        setSimResult(res.data.simulation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSimulate();
  }, [userA_Id, userB_Id]);

  const userA = usersList.find(u => u.userId === userA_Id);
  const userB = usersList.find(u => u.userId === userB_Id);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-rose-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <div className="flex items-center space-x-2 text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Cryptographic Security & Collusion Attack Sandbox</span>
          </div>
          <h1 className="text-2xl font-bold text-white">HABKS-CR Collusion Resistance Demonstration</h1>
          <p className="text-sm text-slate-200 max-w-3xl mt-1">
            Traditional Attribute-Based Encryption (ABE) can suffer from **Collusion Attacks**, where User A and User B pool their distinct attribute keys to satisfy a restricted policy. HABKS-CR embeds user identity factors <code className="text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded">r_ID</code> into decryption key components, rendering cross-user key aggregation mathematically invalid.
          </p>
        </div>
      </div>

      {/* Interactive Collusion Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* User A Selection */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-sky-700 font-bold text-sm">
            <Users className="w-4 h-4" />
            <span>Colluding User A</span>
          </div>

          <select
            value={userA_Id}
            onChange={(e) => setUserA_Id(e.target.value)}
            className="w-full light-input px-3 py-2 rounded-lg text-xs bg-white text-slate-900 font-bold"
          >
            {usersList.map(u => (
              <option key={u.userId} value={u.userId}>
                {u.name} ({u.role}) — {u.userId}
              </option>
            ))}
          </select>

          {userA && (
            <div className="space-y-2 text-xs pt-1">
              <div className="text-slate-500 font-medium">Attributes Held:</div>
              <div className="flex flex-wrap gap-1">
                {userA.attributes.map(a => (
                  <span key={a} className="px-2 py-0.5 text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 rounded font-semibold">
                    {a}
                  </span>
                ))}
              </div>
              <div className="font-mono text-[11px] text-slate-600 pt-1">
                Identity Factor: <span className="text-sky-700 font-bold">{userA.r_ID_Snippet || 'r_ID_Alice'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Plus / Collusion Action Indicator */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 shadow-md">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[11px] font-mono text-rose-700 font-bold uppercase">Attempt Key Fusion</span>
        </div>

        {/* User B Selection */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm">
            <Users className="w-4 h-4" />
            <span>Colluding User B</span>
          </div>

          <select
            value={userB_Id}
            onChange={(e) => setUserB_Id(e.target.value)}
            className="w-full light-input px-3 py-2 rounded-lg text-xs bg-white text-slate-900 font-bold"
          >
            {usersList.map(u => (
              <option key={u.userId} value={u.userId}>
                {u.name} ({u.role}) — {u.userId}
              </option>
            ))}
          </select>

          {userB && (
            <div className="space-y-2 text-xs pt-1">
              <div className="text-slate-500 font-medium">Attributes Held:</div>
              <div className="flex flex-wrap gap-1">
                {userB.attributes.map(a => (
                  <span key={a} className="px-2 py-0.5 text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-semibold">
                    {a}
                  </span>
                ))}
              </div>
              <div className="font-mono text-[11px] text-slate-600 pt-1">
                Identity Factor: <span className="text-indigo-700 font-bold">{userB.r_ID_Snippet || 'r_ID_Bob'}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Target Policy & Collusion Result Verification */}
      {simResult && (
        <div className="space-y-6">
          
          {/* Status Alert */}
          <div className={`p-5 rounded-xl border flex items-start space-x-3 shadow-sm ${
            simResult.analysis.collusionPrevented
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            {simResult.analysis.collusionPrevented ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">
                {simResult.analysis.collusionPrevented
                  ? 'HABKS-CR COLLUSION RESISTANCE VERIFIED: ATTACK DEFEATED'
                  : 'UNPROTECTED COLLUSION VULNERABILITY DETECTED'}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-mono font-medium">
                {simResult.analysis.explanation}
              </p>
            </div>
          </div>

          {/* Detailed Breakdown Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 block font-medium">User A Individual Check</span>
              <div className="font-bold text-sm text-slate-900">{simResult.collusionAttempt.userA.userId}</div>
              <div className="text-xs">
                Satisfies Target Policy Alone?:{' '}
                <strong className={simResult.analysis.userA_Satisfies_Individually ? 'text-emerald-700' : 'text-rose-600'}>
                  {simResult.analysis.userA_Satisfies_Individually ? 'YES' : 'NO'}
                </strong>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 block font-medium">User B Individual Check</span>
              <div className="font-bold text-sm text-slate-900">{simResult.collusionAttempt.userB.userId}</div>
              <div className="text-xs">
                Satisfies Target Policy Alone?:{' '}
                <strong className={simResult.analysis.userB_Satisfies_Individually ? 'text-emerald-700' : 'text-rose-600'}>
                  {simResult.analysis.userB_Satisfies_Individually ? 'YES' : 'NO'}
                </strong>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 block font-medium">Combined Attribute Pool</span>
              <div className="flex flex-wrap gap-1">
                {simResult.collusionAttempt.combinedAttributes.map(ca => (
                  <span key={ca} className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 rounded border border-slate-200 font-semibold">
                    {ca}
                  </span>
                ))}
              </div>
              <div className="text-xs text-slate-600">
                Attributes aggregate to satisfy policy structure?{' '}
                <strong className="text-sky-700 font-bold">
                  {simResult.analysis.attributesCombineToSatisfyTarget ? 'YES (Target of Collusion)' : 'NO'}
                </strong>
              </div>
            </div>

          </div>

          {/* Cryptographic Mathematical Proof Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4" />
              <span>HABKS-CR Identity-Binding Proof Mechanism</span>
            </h4>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2">
              <p className="text-emerald-400">
                1. User Decryption Key Construction: SK_ID = ( D_ID = g^(α + β · r_ID), &#123;D_j = g^(r_ID) · T_j^(r_j)&#125; )
              </p>
              <p className="text-slate-300">
                2. During Pairing Evaluation: e(D_{`{ID_A, attr1}`}, C_1) yields e(g,g)^(r_A · q1(0)), whereas e(D_{`{ID_B, attr2}`}, C_2) yields e(g,g)^(r_B · q2(0)).
              </p>
              <p className="text-rose-400">
                3. Because r_ID_A ({simResult.collusionAttempt.userA.r_ID}) ≠ r_ID_B ({simResult.collusionAttempt.userB.r_ID}), Lagrange interpolation fails: e(g,g)^(r_A · q1(0) + r_B · q2(0)) ≠ e(g,g)^(r_ID · q(0)).
              </p>
              <p className="text-sky-300 font-bold">
                4. Conclusion: Unauthorized user key components cannot be aggregated. Collusion Resistance strictly preserved.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
