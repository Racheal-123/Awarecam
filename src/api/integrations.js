import api from '@/lib/api';

export const invokeLLM = async (data) => {
  const response = await api.post('/integrations/llm/invoke', data);
  return response.data;
};

export const sendEmail = async (data) => {
  const response = await api.post('/integrations/email/send', data);
  return response.data;
};

export const uploadFile = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, value);
  });
  const response = await api.post('/integrations/files/upload', formData);
  return response.data;
};

export const generateImage = async (data) => {
  const response = await api.post('/integrations/image/generate', data);
  return response.data;
};

export const extractDataFromUploadedFile = async (fileId) => {
  const response = await api.post(`/integrations/files/${fileId}/extract`);
  return response.data;
};

export const createFileSignedUrl = async (fileId, options = {}) => {
  const response = await api.post(`/integrations/files/${fileId}/signed-url`, options);
  return response.data;
};

export const uploadPrivateFile = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, value);
  });
  const response = await api.post('/integrations/files/upload/private', formData);
  return response.data;
};






