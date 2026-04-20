import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// ── Token helpers ─────────────────────────────────────────────────────────────
const getAccessToken  = () => sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
const getRefreshToken = () => sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

const saveTokens = (accessToken, refreshToken) => {
  sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN,  accessToken);
  sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

const clearTokens = () => {
  sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.USER);
};

const PUBLIC_ENDPOINTS = [
  '/auth/login', '/auth/register', '/auth/forgot-password',
  '/auth/reset-password', '/auth/refresh', '/auth/oauth/google',
  '/services',
  '/contact',
  '/analytics/track',
];

class ApiService {
  _refreshing = false;

  async request(endpoint, options = {}, retry = true) {
    const url      = `${API_BASE_URL}${endpoint}`;
    const token    = getAccessToken();
    const isPublic = PUBLIC_ENDPOINTS.some(p => endpoint.startsWith(p));

    // For multipart/form-data, don't set Content-Type (browser sets it with boundary)
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config = { ...options, headers };

    try {
      const response    = await fetch(url, config);
      const contentType = response.headers.get('content-type');
      const data        = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

      if (response.status === 401 && retry && !this._refreshing && !isPublic) {
        const refreshed = await this._tryRefresh();
        if (refreshed) return this.request(endpoint, options, false);
        clearTokens();
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const message =
          (typeof data === 'object' && (data.message || data.errors?.[0]?.message)) ||
          (typeof data === 'string' && data.trim()) ||
          this._statusMessage(response.status);
        throw new Error(message);
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  async _tryRefresh() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    this._refreshing = true;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      saveTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    } catch { return false; }
    finally { this._refreshing = false; }
  }

  _statusMessage(status) {
    const map = {
      400: 'Invalid request. Please check your input.',
      401: 'Incorrect email or password.',
      403: 'You do not have permission to do this.',
      404: 'The requested resource was not found.',
      422: 'Validation failed. Please check your input.',
      500: 'Server error. Please try again later.',
    };
    return map[status] || `An error occurred (${status}).`;
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    saveTokens(res.data.accessToken, res.data.refreshToken);
    const user = {
      ...res.data.user,
      mustChangePassword: res.data.mustChangePassword,
      profileCompleted:   res.data.profileCompleted,
      role:               res.data.role,
    };
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  }

  async register(data) {
    return this.request('/auth/register', {
      method: 'POST', body: JSON.stringify(data),
    });
  }

  async logout() {
    const refreshToken = getRefreshToken();
    try {
      await this.request('/auth/logout', {
        method: 'POST', body: JSON.stringify({ refreshToken }),
      });
    } catch {}
    clearTokens();
  }

  async googleSignIn(idToken) {
    const res = await this.request('/auth/oauth/google', {
      method: 'POST', body: JSON.stringify({ idToken }),
    });
    saveTokens(res.data.accessToken, res.data.refreshToken);
    const user = {
      ...res.data.user,
      mustChangePassword: res.data.mustChangePassword,
      profileCompleted:   res.data.profileCompleted,
      role:               res.data.role,
    };
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  }

  async initialChangePassword(newPassword, confirmPassword) {
    const res = await this.request('/auth/initial-change-password', {
      method: 'POST', body: JSON.stringify({ newPassword, confirmPassword }),
    });
    if (res.accessToken && res.refreshToken) saveTokens(res.accessToken, res.refreshToken);
    return res;
  }

  async completeProfile(profileData) {
    return this.request('/auth/complete-profile', {
      method: 'POST', body: JSON.stringify(profileData),
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST', body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword, confirmPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST', body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
  }

  async getMe() {
    const res = await this.request('/auth/me');
    return res.data;
  }

  async changePassword(currentPassword, newPassword, confirmPassword) {
    return this.request('/auth/change-password', {
      method: 'POST', body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  }

  // ── Admin: Users ───────────────────────────────────────────────────────────

  async getAllUsers() {
    const res = await this.request('/auth/admin/users');
    return res.data;
  }

  async createUser(userData) {
    return this.request('/auth/admin/create-user', {
      method: 'POST', body: JSON.stringify(userData),
    });
  }

  async manageUser(data) {
    return this.request('/auth/admin/manage-user', {
      method: 'POST', body: JSON.stringify(data),
    });
  }

  // ── Catalog: Services (public) ─────────────────────────────────────────────

  async getServices() {
    const res = await this.request('/services');
    return res.data;
  }

  async getService(id) {
    const res = await this.request(`/services/${id}`);
    return res.data;
  }

  // ── Catalog: Admin ─────────────────────────────────────────────────────────

  async adminGetServices() {
    const res = await this.request('/services/admin/all');
    return res.data;
  }

  async adminCreateService(formData) {
    return this.request('/services', {
      method: 'POST', body: formData, // FormData
    });
  }

  async adminUpdateService(id, formData) {
    return this.request(`/services/${id}`, {
      method: 'PATCH', body: formData,
    });
  }

  async adminDeleteService(id) {
    return this.request(`/services/${id}`, { method: 'DELETE' });
  }

  async adminCreateProduct(serviceId, formData) {
    return this.request(`/services/${serviceId}/products`, {
      method: 'POST', body: formData,
    });
  }

  async adminUpdateProduct(id, formData) {
    return this.request(`/services/products/${id}`, {
      method: 'PATCH', body: formData,
    });
  }

  async adminDeleteProduct(id) {
    return this.request(`/services/products/${id}`, { method: 'DELETE' });
  }

  // ── Orders ─────────────────────────────────────────────────────────────────

  async placeOrder(data) {
    const res = await this.request('/orders', {
      method: 'POST', body: JSON.stringify(data),
    });
    return res;
  }

  async getMyOrders() {
    const res = await this.request('/orders/my');
    return res.data;
  }

  async getMyOrder(id) {
    const res = await this.request(`/orders/my/${id}`);
    return res.data;
  }

  async respondToOrder(id, action, rejectReason) {
    const res = await this.request(`/orders/my/${id}/respond`, {
      method: 'POST', body: JSON.stringify({ action, rejectReason }),
    });
    return res;
  }

  // ── Orders: Admin ──────────────────────────────────────────────────────────

  async adminGetOrders(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status)   params.set('status',   filters.status);
    if (filters.clientId) params.set('clientId', filters.clientId);
    const query = params.toString();
    const res = await this.request(`/orders${query ? `?${query}` : ''}`);
    return res.data;
  }

  async adminGetOrder(id) {
    const res = await this.request(`/orders/${id}`);
    return res.data;
  }

  async adminApproveOrder(id, quotedPrice, adminNotes) {
    const res = await this.request(`/orders/${id}/approve`, {
      method: 'POST', body: JSON.stringify({ quotedPrice, adminNotes }),
    });
    return res;
  }

  async adminUpdateOrderStatus(id, status, notes) {
    const res = await this.request(`/orders/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status, notes }),
    });
    return res;
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  async getNotifications() {
    const res = await this.request('/notifications');
    return res.data;
  }

  async getUnreadCount() {
    const res = await this.request('/notifications/unread-count');
    return res.data.count;
  }

  async markNotificationsRead(ids) {
    return this.request('/notifications/mark-read', {
      method: 'POST', body: JSON.stringify(ids ? { ids } : {}),
    });
  }

  // SSE stream — returns EventSource-compatible URL with token in header workaround
  // We use fetchEventSource from @microsoft/fetch-event-source in the hook
  getNotificationStreamUrl() {
    return `${API_BASE_URL}/notifications/stream`;
  }

  getAccessToken() {
    return getAccessToken();
  }

  async submitContact(data) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
 
  // ── Contact management (admin only) ───────────────────────────────────────
 
  async adminGetContacts(filters = {}) {
    const params = new URLSearchParams();
    if (filters.isRead !== undefined) params.set('isRead', String(filters.isRead));
    const query = params.toString();
    const res = await this.request(`/contact${query ? `?${query}` : ''}`);
    return res.data;
  }
 
  async adminGetContact(id) {
    const res = await this.request(`/contact/${id}`);
    return res.data;
  }
 
  async adminMarkContactRead(id, isRead = true) {
    const res = await this.request(`/contact/${id}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead }),
    });
    return res.data;
  }
 
  async adminMarkAllContactsRead() {
    return this.request('/contact/mark-all-read', { method: 'POST' });
  }
 
  async adminDeleteContact(id) {
    return this.request(`/contact/${id}`, { method: 'DELETE' });
  }
 
  async adminGetContactUnreadCount() {
    const res = await this.request('/contact/unread-count');
    return res.data.count;
  }

  async getAnalyticsSummary(days = 30) {
    const res = await this.request(`/analytics/summary?days=${days}`);
    return res.data;
  }
  async getAnalyticsVisits(page = 1, limit = 50) {
    const res = await this.request(`/analytics/visits?page=${page}&limit=${limit}`);
    return res.data;
  }

  async submitFeedback({ orderId, rating, message, isPublic = true }) {
    const res = await this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify({ orderId, rating, message, isPublic }),
    });
    return res.data;
  }
  
  async getMyFeedbacks() {
    const res = await this.request('/feedback/my');
    return res.data;
  }
  
  async checkOrderFeedback(orderId) {
    const res = await this.request(`/feedback/check/${orderId}`);
    return res.data.hasReview;
  }
  
  // ── Admin: Feedback ───────────────────────────────────────────────────────────
  
  async adminGetFeedbacks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status  !== undefined) params.set('status',  filters.status);
    if (filters.isRead  !== undefined) params.set('isRead',  filters.isRead);
    const query = params.toString();
    const res = await this.request(`/feedback${query ? `?${query}` : ''}`);
    return res.data;
  }
  
  async adminGetFeedbackStats() {
    const res = await this.request('/feedback/stats');
    return res.data;
  }
  
  async adminGetFeedbackUnreadCount() {
    const res = await this.request('/feedback/unread-count');
    return res.data.count;
  }
  
  async adminRespondToFeedback(id, response) {
    const res = await this.request(`/feedback/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
    return res.data;
  }
  
  async adminMarkFeedbackRead(id) {
    const res = await this.request(`/feedback/${id}/read`, { method: 'PATCH' });
    return res.data;
  }
  
  async adminDeleteFeedback(id) {
    return this.request(`/feedback/${id}`, { method: 'DELETE' });
  }

}

const apiService = new ApiService();
export default apiService;