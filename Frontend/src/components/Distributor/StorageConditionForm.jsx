import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

// ─────────────────────────────────────────────────────────
//  StorageConditionForm
//  Records temperature, humidity, and storage type.
//  Auto-detects threshold breaches and shows alerts.
// ─────────────────────────────────────────────────────────

const STORAGE_TYPES = ['Ambient', 'Cold', 'Frozen', 'Dry'];

// Threshold definitions (for client-side preview)
const THRESHOLDS = {
  Cold:    { minTemp: 0,   maxTemp: 8,   maxHumidity: 85 },
  Frozen:  { minTemp: -30, maxTemp: -10, maxHumidity: 90 },
  Ambient: { minTemp: 15,  maxTemp: 30,  maxHumidity: 70 },
  Dry:     { minTemp: 15,  maxTemp: 28,  maxHumidity: 55 },
};

const checkBreach = (type, temp, humidity) => {
  const t = THRESHOLDS[type] || THRESHOLDS['Ambient'];
  const breaches = [];
  if (temp > t.maxTemp)  breaches.push(`Temp too high (>${t.maxTemp}°C)`);
  if (temp < t.minTemp)  breaches.push(`Temp too low (<${t.minTemp}°C)`);
  if (humidity > t.maxHumidity) breaches.push(`Humidity too high (>${t.maxHumidity}%)`);
  return breaches;
};

const StorageConditionForm = ({ shipment }) => {
  const { token } = useContext(AuthContext);

  const [form, setForm] = useState({
    temperature:  '',
    humidity:     '',
    storageType:  'Ambient',
  });

  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState(null);
  const [preview, setPreview] = useState([]); // live breach preview

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    // Live threshold preview
    if (updated.temperature && updated.humidity) {
      const breaches = checkBreach(
        updated.storageType,
        parseFloat(updated.temperature),
        parseFloat(updated.humidity)
      );
      setPreview(breaches);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shipment?.id) {
      setAlert({ type: 'warning', msg: 'Accept a shipment first.' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const payload = {
        shipmentId:  Number(shipment.id),
        temperature: parseFloat(form.temperature),
        humidity:    parseFloat(form.humidity),
        storageType: form.storageType,
      };

      const res  = await fetch('http://localhost:5160/api/distributor/storage', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: 'error', msg: data.message || 'Failed to record condition.' });
      } else if (data.thresholdBreached) {
        setAlert({ type: 'warning', msg: `⚠️ Condition recorded — THRESHOLD BREACHED! Issue auto-logged.` });
      } else {
        setAlert({ type: 'success', msg: '✅ Storage condition recorded successfully.' });
      }
    } catch {
      setAlert({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const { maxTemp, minTemp, maxHumidity } = THRESHOLDS[form.storageType] || THRESHOLDS['Ambient'];
  const tempNum = parseFloat(form.temperature);
  const humNum  = parseFloat(form.humidity);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center text-xl">
           <i className="bi bi-thermometer-half"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800 m-0">Storage Conditions</h2>
      </div>

      <div className="p-6">
        {!shipment && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <i className="bi bi-exclamation-triangle-fill text-amber-500"></i>
            <p className="text-sm font-semibold text-amber-800 m-0">
              Accept a shipment first to record storage conditions.
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Storage Type *</label>
            <select 
              name="storageType" 
              value={form.storageType} 
              onChange={handleChange} 
              required
              className="w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-violet-500/50 sm:text-sm transition-all focus:bg-white focus:outline-none appearance-none"
            >
              {STORAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Accepted range info mb-4 */}
          <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl">
             <p className="text-xs font-semibold text-violet-700 m-0 flex items-center gap-2">
                 <i className="bi bi-info-circle-fill text-violet-400"></i>
                 Accepted Range: {minTemp}°C – {maxTemp}°C, Humidity ≤{maxHumidity}%
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Temperature (°C) *</label>
              <input
                type="number"
                step="0.1"
                name="temperature"
                placeholder="e.g. 4.5"
                value={form.temperature}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-violet-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
              />
              {/* Gauge */}
              {form.temperature && (
                <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(Math.max(((tempNum - minTemp) / (maxTemp - minTemp)) * 100, 0), 100)}%`,
                      background: preview.some(b => b.includes('Temp')) ? '#ef4444' : '#10b981'
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Humidity (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="humidity"
                placeholder="e.g. 65"
                value={form.humidity}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-violet-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
              />
              {/* Gauge */}
              {form.humidity && (
                <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(humNum, 100)}%`,
                      background: humNum > maxHumidity ? '#ef4444' : '#10b981'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Live breach preview */}
          {preview.length > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
              {preview.map((b, i) => (
                <p key={i} className="text-xs font-bold text-orange-600 m-0">
                  ⚠️ {b}
                </p>
              ))}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !shipment}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-thermometer-sun"></i>}
              Record Condition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StorageConditionForm;
