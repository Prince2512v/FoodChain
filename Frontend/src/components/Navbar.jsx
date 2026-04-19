import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutOverlay from './Dashboard/LogoutOverlay';

const AppNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [showLogout, setShowLogout] = useState(false);
    const [isSimulated, setIsSimulated] = useState(localStorage.getItem('SIMULATION_MODE') === 'true');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleSimulation = () => {
        const newValue = !isSimulated;
        setIsSimulated(newValue);
        localStorage.setItem('SIMULATION_MODE', String(newValue));
        window.location.reload(); 
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Overview', show: true },
        { path: '/farmer-dashboard', icon: 'bi-flower1', label: 'Farm Hub', show: user?.role === 'Farmer' },
        { path: '/processor-dashboard', icon: 'bi-gear-wide-connected', label: 'Processing', show: user?.role === 'Processor' },
        { path: '/distributor-dashboard', icon: 'bi-truck', label: 'Logistics', show: user?.role === 'Distributor' },
        { path: '/retailer-dashboard', icon: 'bi-shop', label: 'Store Front', show: user?.role === 'Retailer' },
        { path: '/admin-dashboard', icon: 'bi-shield-lock-fill', label: 'Admin Core', show: user?.role === 'Admin' },
        { path: '/track', icon: 'bi-search', label: 'Traceability', show: true },
    ];

    const getRoleColor = (role) => {
        const colors = {
            'Farmer': 'bg-emerald-500 shadow-emerald-500/50',
            'Processor': 'bg-amber-500 shadow-amber-500/50',
            'Distributor': 'bg-sky-500 shadow-sky-500/50',
            'Retailer': 'bg-orange-500 shadow-orange-500/50',
            'Admin': 'bg-slate-800 shadow-slate-800/50',
        };
        return colors[role] || 'bg-slate-500 shadow-slate-500/50';
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm z-[1050] transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-[4.5rem]">
                        
                        {/* Brand */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/dashboard" className="flex items-center gap-2 text-xl font-extrabold tracking-[0.02em]">
                                <i className="bi bi-box-seam-fill text-emerald-500"></i>
                                <span className="bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent">
                                    Quantum FoodChain
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-1 lg:space-x-2">
                            {navItems.filter(item => item.show).map(item => (
                                <Link 
                                    key={item.path} 
                                    to={item.path}
                                    className={`relative px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ease-out
                                        ${isActive(item.path) 
                                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-100/50' 
                                            : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-50 border border-transparent'}`}
                                >
                                    <i className={`bi ${item.icon} mr-2`}></i>
                                    {item.label}
                                    {isActive(item.path) && (
                                        <span className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-5 h-[2px] bg-emerald-500 rounded-t-sm"></span>
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Right side controls */}
                        <div className="flex items-center gap-3">
                            {user ? (
                                <>
                                    {/* Simulator Toggle */}
                                    <button 
                                        onClick={toggleSimulation}
                                        title="Toggle Blockchain Simulation Mode"
                                        className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-colors shadow-sm
                                            ${isSimulated ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full shadow-sm ${isSimulated ? 'bg-sky-500 animate-pulse shadow-sky-500/50' : 'bg-slate-400'}`}></span>
                                        {isSimulated ? 'SIMULATOR' : 'METAMASK'}
                                    </button>

                                    {/* User Pill */}
                                    <div className="flex items-center gap-1.5 bg-white/60 p-1 pr-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-default relative">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-100 shadow-sm">
                                            <span className={`w-2 h-2 rounded-sm shadow-sm ${getRoleColor(user.role)}`}></span>
                                            <div className="hidden sm:block text-left">
                                                <p className="text-[0.8rem] font-extrabold text-slate-800 leading-tight">{user.name || 'Account'}</p>
                                                <p className="text-[0.55rem] font-bold text-slate-500 tracking-[0.05em] uppercase">{user.role || 'USER'}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setShowLogout(true)}
                                            className="flex items-center justify-center w-8 h-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                                            title="Sign Out"
                                        >
                                            <i className="bi bi-box-arrow-right text-[0.85rem]"></i>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <Link to="/login" className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full hover:shadow-md hover:-translate-y-0.5 transition-all">
                                    Sign In
                                </Link>
                            )}

                            {/* Mobile menu button */}
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 focus:outline-none transition-colors border border-transparent hover:border-slate-200"
                            >
                                <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'} text-xl`}></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md shadow-xl absolute w-full left-0 origin-top animate-fade-in z-40">
                        <div className="px-4 py-4 space-y-2">
                            {navItems.filter(item => item.show).map(item => (
                                <Link 
                                    key={item.path} 
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-colors
                                        ${isActive(item.path) 
                                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-100/50' 
                                            : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                                >
                                    <i className={`bi ${item.icon} w-6 text-center mr-3 text-lg`}></i>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
            <LogoutOverlay isOpen={showLogout} onClose={() => setShowLogout(false)} />
        </>
    );
};

export default AppNavbar;
