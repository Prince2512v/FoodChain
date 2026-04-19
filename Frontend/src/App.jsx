import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import AddProduct from './pages/AddProduct';
import UpdateStage from './pages/UpdateStage';
import ProductTracker from './pages/Consumer/ProductTracker';
import QRScannerPage from './pages/QRScannerPage';
import ProductAuthenticityPage from './pages/ProductAuthenticityPage';
import 'bootstrap/dist/css/bootstrap.min.css';

import AdminDashboard from './pages/AdminDashboard';
import ProcessorDashboard from './pages/ProcessorDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import RetailerDashboard from './pages/RetailerDashboard';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/farmer-dashboard" element={
                        <ProtectedRoute allowedRoles={['Farmer']}><FarmerDashboard /></ProtectedRoute>
                    } />
                    <Route path="/admin-dashboard" element={
                        <ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>
                    } />
                    <Route path="/processor-dashboard" element={
                        <ProtectedRoute allowedRoles={['Processor']}><ProcessorDashboard /></ProtectedRoute>
                    } />
                    <Route path="/distributor-dashboard" element={
                        <ProtectedRoute allowedRoles={['Distributor']}><DistributorDashboard /></ProtectedRoute>
                    } />
                     <Route path="/retailer-dashboard" element={
                        <ProtectedRoute allowedRoles={['Retailer']}><RetailerDashboard /></ProtectedRoute>
                    } />
                    <Route path="/add-product" element={
                        <ProtectedRoute allowedRoles={['Farmer']}><AddProduct /></ProtectedRoute>
                    } />
                    <Route path="/update-stage" element={
                        <ProtectedRoute><UpdateStage /></ProtectedRoute>
                    } />

                    {/* Public Traceability Portal */}
                    <Route path="/track" element={<ProductTracker />} />
                    <Route path="/track/:batchId" element={<ProductTracker />} />
                    <Route path="/scanner" element={<QRScannerPage />} />
                    <Route path="/verify/:batchId" element={<ProductAuthenticityPage />} />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;

