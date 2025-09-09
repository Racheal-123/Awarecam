import api from '@/lib/api';

export const streamsCallback = async (data) => {
  const response = await api.post('/streams/callback', data);
  return response.data;
};

export const startStream = async (streamId) => {
  const response = await api.post(`/streams/${streamId}/start`);
  return response.data;
};

export const stopStream = async (streamId) => {
  const response = await api.post(`/streams/${streamId}/stop`);
  return response.data;
};

export const fetchStreamStatus = async (streamId) => {
  const response = await api.get(`/streams/${streamId}/status`);
  return response.data;
};

export const testDirectStream = async (streamId) => {
  const response = await api.post(`/streams/${streamId}/test`);
  return response.data;
};

export const hlsProxy = async (streamId, action) => {
  const response = await api.post(`/streams/${streamId}/hls/${action}`);
  return response.data;
};

export const streamHealthMonitor = async (streamId) => {
  const response = await api.get(`/streams/${streamId}/health`);
  return response.data;
};

export const proxyKeepAlive = async (streamId) => {
  const response = await api.post(`/streams/${streamId}/keepalive`);
  return response.data;
};

export const streamWatchdog = async (streamId) => {
  const response = await api.get(`/streams/${streamId}/watchdog`);
  return response.data;
};

