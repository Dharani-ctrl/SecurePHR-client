import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Create Axios Instance targeting Backend Port 5000 directly
const apiClient = axios.create({
  baseURL: API_BASE
});

// Pass active user context headers for RBAC + ABAC validation
export const setAuthHeaders = (userId, userRole) => {
  if (userId) apiClient.defaults.headers.common['x-user-id'] = userId;
  if (userRole) apiClient.defaults.headers.common['x-user-role'] = userRole;
};

// Auth API Calls
export const loginUser = (credentials) => apiClient.post('/auth/login', credentials);
export const registerUser = (userData) => apiClient.post('/auth/register', userData);

// KGC / Admin API Calls
export const getSystemParameters = () => apiClient.get('/kgc/params');
export const addAttribute = (attributeName) => apiClient.post('/kgc/attribute', { attributeName });
export const deactivateAttribute = (attributeName) => apiClient.post('/kgc/deactivate-attribute', { attributeName });
export const registerUserKeyGen = (userData) => apiClient.post('/kgc/register', userData);
export const approveUser = (data) => apiClient.post('/kgc/approve-user', data);
export const suspendUser = (data) => apiClient.post('/kgc/suspend-user', data);
export const revokeUser = (data) => apiClient.post('/kgc/suspend-user', { ...data, action: 'REVOKE' });
export const deleteUser = (data) => apiClient.post('/kgc/delete-user', data);
export const rotateUserKey = (data) => apiClient.post('/kgc/rotate-key', data);
export const clearDatabase = () => apiClient.post('/kgc/clear-database');
export const getUsers = () => apiClient.get('/kgc/users');

// PHR Storage, Search & Decryption API Calls
export const uploadPHR = (phrData) => apiClient.post('/phr/upload', phrData);
export const getCloudPHRList = (patientId = '') => apiClient.get(`/phr/cloud-list${patientId ? `?patientId=${patientId}` : ''}`);
export const revokePHRSharing = (data) => apiClient.post('/phr/revoke-sharing', data);
export const searchPHR = (searchData) => apiClient.post('/phr/search', searchData);
export const decryptPHR = (decryptData) => apiClient.post('/phr/decrypt', decryptData);
export const getUserHistory = (userId) => apiClient.get(`/user/history/${userId}`);

// Security & Analytics API Calls
export const simulateCollusion = (data) => apiClient.post('/security/collusion-simulate', data);
export const getPerformanceBenchmarks = () => apiClient.get('/analytics/benchmarks');
export const getAuditLogs = () => apiClient.get('/audit/logs');
