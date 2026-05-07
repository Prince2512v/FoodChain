import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

// ─────────────────────────────────────────────────────────
//  ShipmentDetailsForm
//  Captures vehicle, driver, and transport information
// ─────────────────────────────────────────────────────────

const TRANSPORT_TYPES = [
  'Truck',
  'Cold Storage Truck',
  'Ship',
  'Air Freight',
  'Rail',
  'Motorcycle',
  'Other',
];

const ShipmentDetailsForm = ({ shipment }) => {
  const { token } = useContext(AuthContext);

  const [form, setForm] = useState({
    shipmentId:    shipment?.id || '',
    vehicleNumber: '',
    driverName:    '',
    driverContact: '',
    transportType: 'Truck',
    dispatchDate:  '',
  });

  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState(null);

  // Keep shipmentId in sync when parent selects a different shipment
  React.useEffect(() => {
    if (shipment?.id) {
      setForm(prev => ({ ...prev, shipmentId: shipment.id }));
    }
  }, [shipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shipmentId) {
      setAlert({ type: 'warning', msg: 'Please accept a shipment first.' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const payload = {
        shipmentId:    Number(form.shipmentId),
        vehicleNumber: form.vehicleNumber,
        driverName:    form.driverName,
        driverContact: form.driverContact,
        transportType: form.transportType,
        dispatchDate:  form.dispatchDate ? new Date(form.dispatchDate).toISOString() : null,
      };

      const res = await api.post('/distributor/shipment-details', payload);

      if (res.status === 200) {
        setAlert({ type: 'success', msg: '✅ Shipment details saved successfully!' });
      } else {
        setAlert({ type: 'error', msg: 'Failed to update shipment details.' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Network error. Please try again.';
      setAlert({ type: 'error', msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl">
           <i className="bi bi-truck"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800 m-0">Shipment Details</h2>
      </div>

      <div className="p-6">
        {!shipment && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <i className="bi bi-exclamation-triangle-fill text-amber-500"></i>
            <p className="text-sm font-semibold text-amber-800 m-0">
              Accept a shipment first to fill in these details.
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
          {/* Shipment ID (read-only — from accepted shipment) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Shipment ID</label>
             <input
              type="text"
              value={form.shipmentId || '—'}
              readOnly
              className="w-full px-4 py-3 bg-slate-100 border-0 text-slate-500 rounded-2xl sm:text-sm opacity-70 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle Number *</label>
              <input
                type="text"
                name="vehicleNumber"
                placeholder="e.g. MH-12-AB-1234"
                value={form.vehicleNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transport Type *</label>
              <select 
                name="transportType" 
                value={form.transportType} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-all focus:bg-white focus:outline-none appearance-none"
              >
                {TRANSPORT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Driver Name *</label>
              <input
                type="text"
                name="driverName"
                placeholder="Full name"
                value={form.driverName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Driver Contact *</label>
               <input
                type="text"
                name="driverContact"
                placeholder="+91 98765 43210"
                value={form.driverContact}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dispatch Date</label>
             <input
              type="datetime-local"
              name="dispatchDate"
              value={form.dispatchDate}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 sm:text-sm transition-all focus:bg-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !shipment}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-save2"></i>}
              Save Shipment Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShipmentDetailsForm;
