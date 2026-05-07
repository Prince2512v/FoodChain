import express from 'express';
import cors from 'cors';
import * as authController from './controllers/auth.js';
import * as farmerController from './controllers/farmer.js';
import * as dashboardController from './controllers/dashboard.js';
import * as processorController from './controllers/processor.js';
import * as distributorController from './controllers/distributor.js';
import * as retailerController from './controllers/retailer.js';
import * as adminController from './controllers/admin.js';
import * as consumerController from './controllers/consumer.js';
import * as qrcodeController from './controllers/qrcode.js';
import * as productController from './controllers/product.js';
import { authenticate } from './middleware/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// Farmer Routes
app.post('/api/farmer/product', authenticate(['Farmer']), farmerController.addProduct);
app.get('/api/farmer/products', authenticate(['Farmer']), farmerController.getFarmerProducts);
app.put('/api/farmer/product/:id', authenticate(['Farmer']), farmerController.updateProduct);
app.post('/api/farmer/blockchain/upload', authenticate(['Farmer']), farmerController.updateBlockchainHash);

// Processor Routes
app.get('/api/processor/incoming-products', authenticate(['Processor']), processorController.getIncomingProducts);
app.get('/api/processor/products', authenticate(['Processor']), processorController.getProcessorProducts);
app.post('/api/processor/process', authenticate(['Processor']), processorController.startProcessing);
app.post('/api/processor/quality-check', authenticate(['Processor']), processorController.performQualityCheck);
app.post('/api/processor/packaging', authenticate(['Processor']), processorController.addPackaging);
app.post('/api/blockchain/process', authenticate(['Processor']), processorController.updateBlockchainHash);
app.get('/api/processor/history/:batchId', authenticate(['Processor']), processorController.getProductHistory);
app.post('/api/processor/reject/:id', authenticate(['Processor']), processorController.rejectProduct);

// Distributor Routes
app.get('/api/distributor/available-shipments', authenticate(['Distributor']), distributorController.getAvailableShipments);
app.get('/api/distributor/my-shipments', authenticate(['Distributor']), distributorController.getMyShipments);
app.post('/api/distributor/accept/:productId', authenticate(['Distributor']), distributorController.acceptShipment);
app.post('/api/distributor/shipment-details', authenticate(['Distributor']), distributorController.updateShipmentDetails);
app.post('/api/distributor/location-update', authenticate(['Distributor']), distributorController.addLocationUpdate);
app.post('/api/distributor/storage', authenticate(['Distributor']), distributorController.addStorageCondition);
app.put('/api/distributor/status/:shipmentId', authenticate(['Distributor']), distributorController.updateDeliveryStatus);
app.post('/api/blockchain/shipment', authenticate(['Distributor']), distributorController.updateBlockchainHash);

// Retailer Routes
app.get('/api/retailer/pending-shipments', authenticate(['Retailer']), retailerController.getPendingShipments);
app.get('/api/retailer/inventory', authenticate(['Retailer']), retailerController.getInventory);
app.get('/api/retailer/products', authenticate(['Retailer']), retailerController.getRetailerProducts);
app.post('/api/retailer/receive', authenticate(['Retailer']), retailerController.receiveProduct);
app.put('/api/retailer/inventory/:id', authenticate(['Retailer']), retailerController.updateInventory);
app.put('/api/retailer/mark-available/:productId', authenticate(['Retailer']), retailerController.markAvailable);

// Admin Routes
app.get('/api/admin/users', authenticate(['Admin']), adminController.getUsers);
app.put('/api/admin/users/:id', authenticate(['Admin']), adminController.updateUser);
app.delete('/api/admin/users/:id', authenticate(['Admin']), adminController.deleteUser);
app.get('/api/admin/stats', authenticate(['Admin']), adminController.getStats);
app.get('/api/admin/transactions', authenticate(['Admin']), adminController.getTransactions);
app.get('/api/admin/audit-logs', authenticate(['Admin']), adminController.getAuditLogs);
app.get('/api/admin/fraud-alerts', authenticate(['Admin']), adminController.getFraudAlerts);

// Consumer & Public Routes
app.get('/api/consumer/product/:batchId', consumerController.getProduct);
app.get('/api/consumer/history/:batchId', consumerController.getHistory);
app.get('/api/consumer/verify/:batchId', consumerController.getVerificationData);
app.post('/api/consumer/feedback', consumerController.submitFeedback);

// QR Code Routes
app.post('/api/qrcode/generate/:productId', authenticate(), qrcodeController.generateQrCode);
app.get('/api/qrcode/:batchId', qrcodeController.getQrCodeByBatch);
app.post('/api/qrcode/scan-log', qrcodeController.recordScan);

// Dashboard Routes
app.get('/api/dashboard/summary', authenticate(), dashboardController.getSummary);
app.get('/api/dashboard/performance', authenticate(), dashboardController.getPerformance);
app.get('/api/dashboard/recent-activities', authenticate(), dashboardController.getRecentActivities);
app.get('/api/dashboard/issues', authenticate(), dashboardController.getAlerts);

// Generic Product Routes
app.get('/api/product', productController.getAll);
app.get('/api/product/:id', productController.getById);
app.get('/api/product/batch/:batchId', productController.getByBatchId);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running on Vercel' });
});

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// For local development only (Vercel uses the export)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Local API server running on http://localhost:${PORT}`);
  });
}

export default app;
