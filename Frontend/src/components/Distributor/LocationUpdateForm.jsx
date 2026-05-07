import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

// ─────────────────────────────────────────────────────────
//  LocationUpdateForm
//  Manual GPS update + IoT simulation ping
//  Also supports recording the location update on blockchain
// ─────────────────────────────────────────────────────────

const LocationUpdateForm = ({ shipment }) => {
  const { token } = useContext(AuthContext);

  const [form, setForm] = useState({
    latitude:     '',
    longitude:    '',
    locationName: '',
    source:       'Manual',
  });

  const [locationHistory, setLocationHistory] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [iotLoading, setIotLoading] = useState(false);
  const [alert,    setAlert]    = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shipment?.id) {
      setAlert({ type: 'warning', msg: 'Accept a shipment first to unlock updates.' });
      return;
    }
    await postLocation({ source: form.source });
  };

  const simulateIoT = async () => {
    if (!shipment?.id) {
      setAlert({ type: 'warning', msg: 'Accept a shipment first.' });
      return;
    }
    // Simulate a GPS ping with random deviation (within ±0.01°)
    const simulatedLat = (parseFloat(form.latitude || '19.0760') + (Math.random() * 0.02 - 0.01)).toFixed(6);
    const simulatedLng = (parseFloat(form.longitude || '72.8777') + (Math.random() * 0.02 - 0.01)).toFixed(6);

    setIotLoading(true);
    await postLocation({ source: 'IoT', lat: simulatedLat, lng: simulatedLng });
    setIotLoading(false);
  };

  const postLocation = async ({ source, lat, lng }) => {
    setLoading(true);
    setAlert(null);
    try {
      const payload = {
        shipmentId:   Number(shipment.id),
        latitude:     parseFloat(lat ?? form.latitude),
        longitude:    parseFloat(lng ?? form.longitude),
        locationName: form.locationName,
        source:       source || form.source,
      };

      const res = await api.post('/distributor/location-update', payload);

      if (res.status === 200) {
        setAlert({ type: 'success', msg: `📍 Location recorded! (${source})` });
        setLocationHistory(prev => [{
          latitude:     payload.latitude,
          longitude:    payload.longitude,
          locationName: payload.locationName,
          source:       payload.source,
          timestamp:    new Date().toISOString(),
        }, ...prev].slice(0, 5));
      } else {
        setAlert({ type: 'error', msg: 'Failed to update location.' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Network error. Please try again.';
      setAlert({ type: 'error', msg });
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = () => {
    if (!form.latitude || !form.longitude) return;
    window.open(`https://www.google.com/maps?q=${form.latitude},${form.longitude}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl">
          <i className="bi bi-geo-alt-fill"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800 m-0">Location Update</h2>
      </div>

      <div className="p-6">
        {!shipment && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <i className="bi bi-exclamation-triangle-fill text-amber-500"></i>
            <p className="text-sm font-semibold text-amber-800 m-0">
              Accept a shipment first to log location updates.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Latitude *</label>
              <input
                type="number"
                step="any"
                name="latitude"
                placeholder="19.076090"
                value={form.latitude}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-sky-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Longitude *</label>
              <input
                type="number"
                step="any"
                name="longitude"
                placeholder="72.877426"
                value={form.longitude}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-sky-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location Name</label>
              <input
                type="text"
                name="locationName"
                placeholder="e.g. Mumbai Checkpoint"
                value={form.locationName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-sky-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Source</label>
              <select 
                name="source" 
                value={form.source} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-sky-500/50 sm:text-sm transition-all focus:bg-white focus:outline-none appearance-none"
              >
                <option value="Manual">Manual</option>
                <option value="GPS">GPS</option>
                <option value="IoT">IoT</option>
              </select>
            </div>
          </div>

          {form.latitude && form.longitude && (
            <button 
              type="button" 
              onClick={openInMaps}
              className="w-full py-2.5 text-sm font-semibold text-sky-600 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors border border-sky-100 flex items-center justify-center gap-2"
            >
              <i className="bi bi-map-fill"></i> Preview on Google Maps <i className="bi bi-box-arrow-up-right text-xs ml-1"></i>
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !shipment}
              className="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-pin-map-fill"></i>}
              Log Location
            </button>

            <button
              type="button"
              onClick={simulateIoT}
              disabled={iotLoading || !shipment}
              className="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {iotLoading ? <span className="spinner-border spinner-border-sm text-sky-600"></span> : <i className="bi bi-broadcast"></i>}
              IoT Simulate
            </button>
          </div>
        </form>

        {/* Location History */}
        {locationHistory.length > 0 && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i className="bi bi-clock-history"></i> Recent Updates (Session)
            </h4>
            <div className="space-y-3">
              {locationHistory.map((log, i) => (
                <div key={i} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${log.source === 'IoT' ? 'bg-orange-100 text-orange-700' : 'bg-sky-100 text-sky-700'}`}>
                      {log.source}
                    </span>
                    <span className="font-mono text-slate-500 text-xs">
                      {parseFloat(log.latitude).toFixed(4)}, {parseFloat(log.longitude).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between flex-1 min-w-[200px]">
                     <span className="font-medium text-slate-700">{log.locationName || 'Unnamed'}</span>
                     <span className="text-slate-400 text-xs flex items-center gap-1">
                        <i className="bi bi-clock"></i> {new Date(log.timestamp).toLocaleTimeString()}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationUpdateForm;
