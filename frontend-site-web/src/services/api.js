// API Service for AfricaVet Frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

// Helper to resolve image URLs to the backend
export const getImageUrl = (path, fallback = null) => {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: error.message };
  }
};

// Helper for authenticated API calls
const authCall = (endpoint, token, options = {}) => {
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

// Helper for file uploads
const apiUpload = async (endpoint, formData, token) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error('Upload Error:', error);
    return { success: false, message: error.message };
  }
};

// Posts API
export const postsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/posts${query ? `?${query}` : ''}`);
  },
  getBySlug: (slug) => apiCall(`/posts/${slug}`),
  getByCategory: (categorySlug, page = 1, limit = 10) => {
    const query = new URLSearchParams({ category: categorySlug, page, limit }).toString();
    return apiCall(`/posts?${query}`);
  },
  getPopular: (limit = 10) => apiCall(`/posts?limit=${limit}&sort=view_count&order=DESC`),
  getFeatured: (limit = 5) => apiCall(`/posts?featured=true&limit=${limit}`),
  getLatest: (limit = 10) => apiCall(`/posts?limit=${limit}&sort=created_at&order=DESC`),
  search: (query, params = {}) => {
    const searchParams = new URLSearchParams({ ...params, search: query }).toString();
    return apiCall(`/posts?${searchParams}`);
  },
};

// Categories API
export const categoriesApi = {
  getAll: () => apiCall('/categories'),
  getTree: () => apiCall('/categories/tree'),
  getBySlug: (slug) => apiCall(`/categories/slug/${slug}`),
};

// Pages API
export const pagesApi = {
  getBySlug: (slug) => apiCall(`/pages/slug/${slug}`),
};

// Settings API
export const settingsApi = {
  getPublic: () => apiCall('/settings/public'),
};

// Sliders API
export const slidersApi = {
  getBySlug: (slug) => apiCall(`/sliders/slug/${slug}`),
};

// Menus API
export const menusApi = {
  getBySlug: (slug) => apiCall(`/menus/slug/${slug}`),
  getByLocation: (location) => apiCall(`/menus/location/${location}`),
};

// Auth API
export const authApi = {
  login: (email, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (formData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(formData),
  }),
  getMe: (token) => authCall('/auth/me', token),
  updateProfile: (data, token) => authCall('/auth/profile', token, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changePassword: (data, token) => authCall('/auth/password', token, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  uploadCV: (formData, token) => apiUpload('/auth/profile/cv', formData, token),
  deleteCV: (token) => authCall('/auth/profile/cv', token, { method: 'DELETE' }),
  verifyEmail: (verificationToken) => apiCall(`/auth/verify-email/${verificationToken}`),
  resendVerification: (email) => apiCall('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  getNotificationPrefs: (token) => authCall('/auth/notification-preferences', token),
  updateNotificationPrefs: (data, token) => authCall('/auth/notification-preferences', token, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// E-Learning API
export const elearningApi = {
  getCourses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/elearning/courses${query ? `?${query}` : ''}`);
  },
  getCourseBySlug: (slug) => apiCall(`/elearning/courses/${slug}`),
  getCourseBySlugPublic: (slug) => apiCall(`/elearning/courses/${slug}/public`),
  getCategories: () => apiCall('/elearning/categories'),
  enrollCourse: (courseId, token) => authCall(`/elearning/courses/${courseId}/enroll`, token, { method: 'POST' }),
  getMyEnrollments: (token) => authCall('/elearning/my-courses', token),
  getLesson: (lessonId, token) => authCall(`/elearning/lessons/${lessonId}`, token),
  completeLesson: (lessonId, token) => authCall(`/elearning/lessons/${lessonId}/complete`, token, { method: 'POST' }),
  getQuiz: (quizId, token) => authCall(`/elearning/quizzes/${quizId}`, token),
  submitQuiz: (quizId, answers, token) => authCall(`/elearning/quizzes/${quizId}/submit`, token, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  }),
  getMyCertificates: (token) => authCall('/elearning/my-certificates', token),
  verifyCertificate: (code) => apiCall(`/elearning/certificates/verify/${code}`),
  getLearningPaths: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/elearning/learning-paths${query ? `?${query}` : ''}`);
  },
  getLearningPathBySlug: (slug) => apiCall(`/elearning/learning-paths/${slug}`),
  getCourseProgress: (courseId, token) => authCall(`/elearning/courses/${courseId}/progress`, token),
};

// Opportunities API
export const opportunitiesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/opportunities${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiCall(`/opportunities/${id}`),
  getCategories: () => apiCall('/opportunities/categories'),
  getStats: () => apiCall('/opportunities/stats'),
  apply: (id, formData, token) => apiUpload(`/opportunities/${id}/apply`, formData, token),
  create: (formData, token) => apiUpload('/opportunities', formData, token),
};

// Vet Alerts API
export const vetAlertsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/vet-alerts${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiCall(`/vet-alerts/${id}`),
  getStats: () => apiCall('/vet-alerts/stats/summary'),
  submit: (formData) => {
    return fetch(`${API_BASE_URL}/vet-alerts`, {
      method: 'POST',
      body: formData,
    }).then(r => r.json()).catch(e => ({ success: false, message: e.message }));
  },
};

// Annuaire / Mapping API
export const annuaireApi = {
  getExperts: (params = {}) => {
    const query = new URLSearchParams({ ...params, type: 'expert' }).toString();
    return apiCall(`/mapping?${query}`);
  },
  getOrganizations: (params = {}) => {
    const query = new URLSearchParams({ ...params, type: 'organization' }).toString();
    return apiCall(`/mapping?${query}`);
  },
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/mapping${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiCall(`/mapping/${id}`),
  submit: (data, token) => authCall('/mapping', token, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Newsletter API
export const newsletterApi = {
  subscribe: (email, name = '') => apiCall('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email, name }),
  }),
  confirmSubscription: (token) => apiCall(`/newsletter/confirm/${token}`),
  unsubscribe: (email, token) => apiCall('/newsletter/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ email, token }),
  }),
};

// Documents / Library API
export const documentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/documents${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiCall(`/documents/${id}`),
  getFeatured: (limit = 6) => apiCall(`/documents/featured?limit=${limit}`),
  getRecent: (limit = 10) => apiCall(`/documents/recent?limit=${limit}`),
  getStats: () => apiCall('/documents/stats'),
  getCountries: () => apiCall('/documents/countries'),
  getCategoriesTree: () => apiCall('/documents/categories/tree'),
  getByCategory: (slug, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/documents/categories/${slug}${query ? `?${query}` : ''}`);
  },
  getDownloadUrl: (id) => `${API_BASE_URL}/documents/${id}/download`,
};

// Notifications API
export const notificationsApi = {
  getAll: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return authCall(`/notifications${query ? `?${query}` : ''}`, token);
  },
  getUnreadCount: (token) => authCall('/notifications/unread-count', token),
  markAsRead: (id, token) => authCall(`/notifications/${id}/read`, token, { method: 'PUT' }),
  markAllAsRead: (token) => authCall('/notifications/read-all', token, { method: 'PUT' }),
  delete: (id, token) => authCall(`/notifications/${id}`, token, { method: 'DELETE' }),
};

// Contact API
export const contactApi = {
  submit: (formData) => apiCall('/contact', {
    method: 'POST',
    body: JSON.stringify(formData),
  }),
};

export { API_BASE_URL, BACKEND_URL, apiCall, authCall, apiUpload };

export default {
  posts: postsApi,
  categories: categoriesApi,
  pages: pagesApi,
  newsletter: newsletterApi,
  settings: settingsApi,
  sliders: slidersApi,
  menus: menusApi,
  auth: authApi,
  elearning: elearningApi,
  opportunities: opportunitiesApi,
  vetAlerts: vetAlertsApi,
  annuaire: annuaireApi,
  documents: documentsApi,
  notifications: notificationsApi,
  contact: contactApi,
};
