// ============== API CONFIG ==============
const API_URL = process.env.REACT_APP_API_URL || '/api';
export const API_BASE_URL = API_URL;

export const safeJson = async (res) => {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : { success: false, message: 'Empty response' };
  } catch (e) {
    console.error('JSON parse error:', e);
    return { success: false, message: 'Invalid JSON response' };
  }
};

export const api = {
  get: async (endpoint, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      return safeJson(res);
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Connection error' };
    }
  },
  post: async (endpoint, data, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return safeJson(res);
    } catch (error) {
      return { success: false, message: 'Connection error' };
    }
  },
  put: async (endpoint, data, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return safeJson(res);
    } catch (error) {
      return { success: false, message: 'Connection error' };
    }
  },
  delete: async (endpoint, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return safeJson(res);
    } catch (error) {
      return { success: false, message: 'Connection error' };
    }
  },
  upload: async (endpoint, formData, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      return safeJson(res);
    } catch (error) {
      return { success: false, message: 'Upload error' };
    }
  }
};

// Helper to get token from localStorage
export const getToken = () => {
  try {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const parsed = JSON.parse(userDetails);
      return parsed.token || null;
    }
  } catch (e) {
    console.error('Error getting token:', e);
  }
  return null;
};

export default api;
