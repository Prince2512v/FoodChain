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
import YieldDetails from './pages/YieldDetails';
import MetricDetails from './pages/MetricDetails';
import QueueDetails from './pages/QueueDetails';
import AuditLogs from './pages/AuditLogs';

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
                    <Route path="/audit-logs" element={
                        <ProtectedRoute><AuditLogs /></ProtectedRoute>
                    } />
                    <Route path="/farmer-dashboard" element={
                        <ProtectedRoute allowedRoles={['Farmer']}><FarmerDashboard /></ProtectedRoute>
                    } />
                    <Route path="/yield-details" element={
                        <ProtectedRoute allowedRoles={['Farmer']}><YieldDetails /></ProtectedRoute>
                    } />
                     <Route path="/metric-details/:type" element={
                        <ProtectedRoute allowedRoles={['Farmer']}><MetricDetails /></ProtectedRoute>
                    } />
                    <Route path="/processing-details" element={
                        <ProtectedRoute allowedRoles={['Farmer']}><MetricDetails type="processing" /></ProtectedRoute>
                    } />
                    <Route path="/delivered-details" element={
                        <ProtectedRoute allowedRoles={['Farmer']}><MetricDetails type="delivered" /></ProtectedRoute>
                    } />
                    <Route path="/quality-alerts" element={
                        <ProtectedRoute allowedRoles={['Farmer']}><MetricDetails type="alerts" /></ProtectedRoute>
                    } />
                    <Route path="/queue-details" element={
                        <ProtectedRoute allowedRoles={['Processor']}><QueueDetails /></ProtectedRoute>
                    } />
                    <Route path="/proc-processing-details" element={
                        <ProtectedRoute allowedRoles={['Processor']}><MetricDetails type="processing" /></ProtectedRoute>
                    } />
                    <Route path="/packaged-details" element={
                        <ProtectedRoute allowedRoles={['Processor']}><MetricDetails type="packaged" /></ProtectedRoute>
                    } />
                    <Route path="/proc-quality-alerts" element={
                        <ProtectedRoute allowedRoles={['Processor']}><MetricDetails type="alerts" /></ProtectedRoute>
                    } />
                    <Route path="/dist-active-shipments" element={
                        <ProtectedRoute allowedRoles={['Distributor']}><MetricDetails type="processing" /></ProtectedRoute>
                    } />
                    <Route path="/dist-queue" element={
                        <ProtectedRoute allowedRoles={['Distributor']}><MetricDetails type="packaged" /></ProtectedRoute>
                    } />
                    <Route path="/dist-alerts" element={
                        <ProtectedRoute allowedRoles={['Distributor']}><MetricDetails type="alerts" /></ProtectedRoute>
                    } />
                    <Route path="/ret-stock" element={
                        <ProtectedRoute allowedRoles={['Retailer']}><MetricDetails type="delivered" /></ProtectedRoute>
                    } />
                    <Route path="/ret-pending" element={
                        <ProtectedRoute allowedRoles={['Retailer']}><MetricDetails type="processing" /></ProtectedRoute>
                    } />
                    <Route path="/ret-alerts" element={
                        <ProtectedRoute allowedRoles={['Retailer']}><MetricDetails type="alerts" /></ProtectedRoute>
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

