import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { role } = await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            if (err.response) {
                const msg = err.response.data;
                setError(typeof msg === 'string' ? msg : 'Invalid email or password.');
            } else if (err.request) {
                setError('Cannot connect to server. Please ensure the backend is running.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4">
                        <i className="bi bi-box-seam-fill text-2xl text-emerald-500"></i>
                    </div>
                    <h2 className="text-[2.1rem] font-extrabold text-slate-900 tracking-tight leading-none mb-2">
                        Quantum FoodChain
                    </h2>
                    <p className="text-sm font-medium text-slate-500">
                        Sign in to the supply chain core
                    </p>
                </div>

                <div className="bg-white/90 backdrop-blur-xl py-8 px-8 sm:rounded-3xl sm:px-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white">
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
                            <i className="bi bi-exclamation-triangle-fill text-red-500"></i>
                            <p className="text-sm font-bold text-red-700 m-0">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">
                                Network Credential (Email)
                            </label>
                            <div className="relative rounded-2xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="bi bi-envelope-at text-slate-400"></i>
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-inset focus:ring-emerald-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
                                    placeholder="you@domain.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-500">
                                    Access Key
                                </label>
                                <span className="text-xs font-bold text-emerald-600 hover:text-emerald-500 cursor-pointer transition-colors">
                                    Forgot?
                                </span>
                            </div>
                            <div className="relative rounded-2xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="bi bi-lock-fill text-slate-400"></i>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border-0 text-slate-900 rounded-2xl focus:ring-2 focus:ring-inset focus:ring-emerald-500/50 sm:text-sm transition-all focus:bg-white placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="p-2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                    >
                                        <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-[1.25rem] shadow-sm text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <i className="bi bi-box-arrow-in-right"></i>
                                )}
                                Initialize Authentication
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm font-medium">
                        <span className="text-slate-500">New to the network? </span>
                        <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                            Provision Account
                        </Link>
                    </div>

                    {/* Demo Credentials Box */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                            <h4 className="text-[0.6rem] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                                Authorized Demo Access
                            </h4>
                            <div className="space-y-2 text-xs">
                                <div 
                                    className="flex justify-between items-center text-slate-500 hover:bg-slate-100/50 p-1.5 rounded-xl transition-colors cursor-pointer group"
                                    onClick={() => { setEmail('admin@demo.com'); setPassword('123456'); }}
                                >
                                    <span className="font-semibold flex items-center gap-1.5">
                                        <i className="bi bi-shield-lock-fill text-sky-500 group-hover:scale-110 transition-transform"></i> Admin
                                    </span>
                                    <span className="font-bold text-slate-700">admin@demo.com</span>
                                </div>
                                <div 
                                    className="flex justify-between items-center text-slate-500 hover:bg-slate-100/50 p-1.5 rounded-xl transition-colors cursor-pointer group"
                                    onClick={() => { setEmail('farmer@demo.com'); setPassword('123456'); }}
                                >
                                    <span className="font-semibold flex items-center gap-1.5">
                                        <i className="bi bi-flower1 text-emerald-500 group-hover:scale-110 transition-transform"></i> Farmer
                                    </span>
                                    <span className="font-bold text-slate-700">farmer@demo.com</span>
                                </div>
                            </div>
                        </div>
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

export default Login;
