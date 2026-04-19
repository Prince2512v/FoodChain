import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

// ─────────────────────────────────────────────────────────
//  IssueReportForm
//  Report delays, damage, or temperature breaches.
//  Automatically updates shipment status.
// ─────────────────────────────────────────────────────────

const ISSUE_TYPES = [
  { value: 'Delay',             label: '⏰ Delay',              desc: 'Shipment is taking longer than expected' },
  { value: 'Damage',            label: '💥 Damage',             desc: 'Product or packaging has been damaged' },
  { value: 'Temperature Issue', label: '🌡️ Temperature Issue',  desc: 'Temperature went out of safe range' },
  { value: 'Vehicle Breakdown', label: '🔧 Vehicle Breakdown',  desc: 'Transport vehicle has broken down' },
  { value: 'Route Blockage',    label: '🚧 Route Blockage',     desc: 'Road block or route interruption' },
  { value: 'Other',             label: '❓ Other',              desc: 'Any other issue not listed above' },
];

const SEVERITY_LEVELS = [
  { value: 'Low',    baseClass: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100', activeClass: 'text-emerald-800 bg-emerald-200 border-emerald-500 shadow-sm' },
  { value: 'Medium', baseClass: 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100', activeClass: 'text-amber-800 bg-amber-200 border-amber-500 shadow-sm' },
  { value: 'High',   baseClass: 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100', activeClass: 'text-red-800 bg-red-200 border-red-500 shadow-sm' },
];

const IssueReportForm = ({ shipment }) => {
  const { token } = useContext(AuthContext);

  const [form, setForm] = useState({
    issueType:   '',
    description: '',
    severity:    'Medium',
  });

  const [loading,      setLoading]      = useState(false);
  const [alert,        setAlert]        = useState(null);
  const [reportedIssues, setReportedIssues] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shipment?.id) {
      setAlert({ type: 'warning', msg: 'Accept and select a shipment first.' });
      return;
    }

    if (!form.issueType) {
      setAlert({ type: 'warning', msg: 'Please select an issue type.' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const payload = {
        shipmentId:  Number(shipment.id),
        issueType:   form.issueType,
        description: form.description,
        severity:    form.severity,
      };

      const res  = await fetch('http://localhost:5160/api/distributor/report-issue', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: 'error', msg: data.message || 'Failed to report issue.' });
      } else {
        setAlert({ type: 'success', msg: '✅ Issue reported. Shipment status updated.' });
        setReportedIssues(prev => [{ ...payload, timestamp: new Date().toISOString() }, ...prev]);
        setForm({ issueType: '', description: '', severity: 'Medium' });
      }
    } catch {
      setAlert({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const selectedIssue = ISSUE_TYPES.find(t => t.value === form.issueType);

  return (
    <div className="w-full">
      <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl shadow-sm text-center md:text-left flex flex-col md:flex-row items-center gap-6">
        <div className="h-16 w-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        <div>
           <h2 className="text-2xl font-extrabold text-red-800 m-0 mb-1">Report Logistics Issue</h2>
           <p className="text-sm font-medium text-red-600/80 m-0">
             Log delays, damage, or other operational problems instantly to alert the network.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Form Column */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 m-0 flex items-center gap-2">
                <i className="bi bi-clipboard2-x text-slate-400"></i> Issue Details
            </h2>
          </div>

          <div className="p-6">
            {!shipment && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                <i className="bi bi-exclamation-triangle-fill text-amber-500"></i>
                <p className="text-sm font-semibold text-amber-800 m-0">
                  Select an active shipment to report an issue.
                </p>
              </div>
            )}

            {alert && (
              <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${
                alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
                alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                 <i className={`bi ${alert.type === 'error' ? 'bi-x-circle-fill' : alert.type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`}></i>
                <p className="text-sm font-semibold m-0">{alert.msg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Issue Type Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Issue Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ISSUE_TYPES.map(it => (
                    <button
                      type="button"
                      key={it.value}
                      className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                        form.issueType === it.value 
                        ? 'bg-red-50 text-red-600 border-red-300 shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                      onClick={() => setForm(prev => ({ ...prev, issueType: it.value }))}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
                {selectedIssue && (
                  <p className="mt-2 text-xs font-medium text-slate-500 italic flex items-center gap-1.5">
                      <i className="bi bi-info-circle"></i> {selectedIssue.desc}
                  </p>
                )}
              </div>

              {/* Severity */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Severity Rating *</label>
                <div className="flex gap-3">
                  {SEVERITY_LEVELS.map(s => (
                    <button
                      type="button"
                      key={s.value}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                        form.severity === s.value ? s.activeClass : s.baseClass
                      }`}
                      onClick={() => setForm(prev => ({ ...prev, severity: s.value }))}
                    >
                      {s.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description *</label>
                <textarea
                  name="description"
                  placeholder="Describe the issue in detail…"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-red-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400 resize-y"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !shipment}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-send-exclamation"></i>}
                  Submit Issue Report
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Issues Log Column */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800 m-0 flex items-center gap-2">
                 <i className="bi bi-clock-history text-slate-400"></i> Reported Issues
            </h2>
            <p className="text-xs text-slate-500 mt-1 m-0">Temporary logs for the current session.</p>
          </div>
          
          <div className="p-6">
            {!reportedIssues.length ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  <i className="bi bi-check2-all"></i>
                </div>
                <p className="text-slate-500 font-medium m-0">No issues reported yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reportedIssues.map((issue, i) => {
                   const sev = SEVERITY_LEVELS.find(s => s.value === issue.severity); 
                   const severityColor = issue.severity === 'High' ? 'text-red-700 bg-red-100' : issue.severity === 'Medium' ? 'text-amber-700 bg-amber-100' : 'text-emerald-700 bg-emerald-100';
                  return (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                            {issue.issueType}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-widest ${severityColor}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 bg-white p-3 rounded-xl border border-slate-100 font-medium whitespace-pre-wrap">
                          {issue.description}
                      </p>
                      <div className="text-right">
                          <p className="text-[0.7rem] text-slate-400 font-mono m-0 flex items-center justify-end gap-1">
                            <i className="bi bi-clock"></i> {new Date(issue.timestamp).toLocaleString()}
                          </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default IssueReportForm;
