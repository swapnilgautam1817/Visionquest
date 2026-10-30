const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error ${response.status}`);
  }
  return response.json();
}

export const api = {
  // System Health
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  // Cameras
  async getCameras() {
    const res = await fetch(`${BASE_URL}/cameras`);
    return handleResponse(res);
  },

  async createCamera(data) {
    const res = await fetch(`${BASE_URL}/cameras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateCamera(id, data) {
    const res = await fetch(`${BASE_URL}/cameras/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteCamera(id) {
    const res = await fetch(`${BASE_URL}/cameras/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Incidents
  async getIncidents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/incidents${query ? `?${query}` : ''}`);
    return handleResponse(res);
  },

  async createIncident(data) {
    const res = await fetch(`${BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async resolveIncident(id, data) {
    const res = await fetch(`${BASE_URL}/incidents/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Inspections
  async getInspections(limit = 50) {
    const res = await fetch(`${BASE_URL}/inspections?limit=${limit}`);
    return handleResponse(res);
  },

  async analyzeInspection(formData) {
    const res = await fetch(`${BASE_URL}/inspections/analyze`, {
      method: 'POST',
      body: formData // multipart/form-data
    });
    return handleResponse(res);
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics`);
    return handleResponse(res);
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${BASE_URL}/settings`);
    return handleResponse(res);
  },

  async updateSettings(data) {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async testGemini(apiKey, model) {
    const res = await fetch(`${BASE_URL}/settings/test-gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, model })
    });
    return handleResponse(res);
  },

  async testSupabase() {
    const res = await fetch(`${BASE_URL}/settings/test-supabase`, {
      method: 'POST'
    });
    return handleResponse(res);
  }
};
