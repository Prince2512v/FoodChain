import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Farmer' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const validate = () => {
        if (!form.name.trim()) return 'Name is required.';
        if (!form.email.includes('@')) return 'Enter a valid email.';
        if (form.password.length < 6) return 'Password must be at least 6 characters.';
        if (form.password !== form.confirmPassword) return 'Passwords do not match.';
        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.role);
            setSuccess('Account created! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            if (err.response) {
                const msg = err.response.data;
                setError(typeof msg === 'string' ? msg : (msg.message || 'Registration failed. Please check your details.'));
            } else if (err.request) {
                setError('Cannot connect to server. Please ensure the backend is running.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { value: 'Farmer', icon: '🌾', label: 'Farmer' },
        { value: 'Processor', icon: '🏭', label: 'Processor' },
        { value: 'Distributor', icon: '🚚', label: 'Distributor' },
        { value: 'Retailer', icon: '🏪', label: 'Retailer' },
        { value: 'Admin', icon: '🛡️', label: 'Admin' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-xl animate-fade-in relative z-10 w-full px-4 sm:px-0">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4">
                        <i className="bi bi-person-plus-fill text-2xl text-emerald-500"></i>
                    </div>
                    <h2 className="text-[2.1rem] font-extrabold text-slate-900 tracking-tight leading-none mb-2">
                        Join the Network
                    </h2>
                    <p className="text-sm font-medium text-slate-500">
                        Register your node in the Quantum FoodChain
                    </p>
                </div>

                <div className="bg-white/90 backdrop-blur-xl py-8 px-6 sm:rounded-3xl sm:px-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white">
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
                            <i className="bi bi-exclamation-triangle-fill text-red-500"></i>
                            <p className="text-sm font-bold text-red-700 m-0">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                            <i className="bi bi-check-circle-fill text-emerald-500"></i>
                            <p className="text-sm font-bold text-emerald-700 m-0">{success}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleRegister}>
                        {/* Role Selection Grid */}
                        <div>
                            <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 text-center">
                                Network Identity
                            </label>
                            <div className="flex flex-wrap justify-center gap-3">
                                {roles.map(r => (
                                    <div
                                        key={r.value}
                                        onClick={() => setForm({ ...form, role: r.value })}
                                        className={`flex-1 min-w-[70px] p-3 rounded-2xl text-center cursor-pointer border transition-all duration-300 flex flex-col items-center justify-center ${
                                            form.role === r.value 
                                            ? 'bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-500/10 scale-105' 
                                            : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-300 hover:bg-emerald-50/30'
                                        }`}
                                    >
                                        <span className="text-2xl block mb-1 filter drop-shadow-sm">{r.icon}</span>
                                        <div className={`text-[0.65rem] font-bold uppercase tracking-wider ${form.role === r.value ? 'text-emerald-700' : 'text-slate-500'}`}>
                                            {r.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Input Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Legal Identity</label>
                                <input
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="block w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-inset focus:ring-emerald-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
                                    placeholder="Full Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Official Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="block w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-inset focus:ring-emerald-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
                                    placeholder="you@domain.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Access Key</label>
                                <input
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="block w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-inset focus:ring-emerald-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Confirm Key</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="block w-full px-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-inset focus:ring-emerald-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-[1.25rem] shadow-sm text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <i className="bi bi-person-plus-fill"></i>
                                )}
                                Provision Identity
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm font-medium">
                        <span className="text-slate-500">Node already registered? </span>
                        <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Register;
