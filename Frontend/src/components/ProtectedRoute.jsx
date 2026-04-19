import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const dashboardMap = {
            'Admin': '/admin-dashboard',
            'Farmer': '/farmer-dashboard',
            'Processor': '/processor-dashboard',
            'Distributor': '/distributor-dashboard',
            'Retailer': '/retailer-dashboard',
            'Consumer': '/track'
        };
        return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;
