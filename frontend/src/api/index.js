import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Dashboard
export const getDashboardSummary = () => api.get('/dashboard/summary').then(r => r.data);

// Locations
export const getLocations = () => api.get('/locations').then(r => r.data);
export const getLocation = (id) => api.get(`/locations/${id}`).then(r => r.data);
export const getLocationRobots = (id) => api.get(`/locations/${id}/robots`).then(r => r.data);
export const getLocationStats = (id, period = 'hourly') => api.get(`/locations/${id}/stats?period=${period}`).then(r => r.data);

// Robots
export const getRobots = () => api.get('/robots').then(r => r.data);
export const getRobot = (id) => api.get(`/robots/${id}`).then(r => r.data);
export const getRobotRides = (id, page = 1, limit = 20) => api.get(`/robots/${id}/rides?page=${page}&limit=${limit}`).then(r => r.data);
export const getRobotStats = (id, period = 'hourly') => api.get(`/robots/${id}/stats?period=${period}`).then(r => r.data);

export default api;
