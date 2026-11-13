import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 seconds for OCR & LLM processing
});

/**
 * Upload and analyze laboratory report (PDF, JPG, PNG).
 * Connects directly to FastAPI POST /api/reports/analyze.
 */
export async function analyzeReportFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/reports/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Health check endpoint for backend and OCR service.
 */
export async function checkBackendHealth() {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
}

export async function explainRawText(rawText) {
  const response = await api.post('/api/explain', { raw_text: rawText });
  return response.data;
}

export async function fetchUserHistory(userId) {
  const response = await api.get('/api/history', {
    params: { user_id: userId },
  });
  return response.data.reports || [];
}

export default api;
