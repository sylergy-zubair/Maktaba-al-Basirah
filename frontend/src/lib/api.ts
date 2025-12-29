import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string>;
  };
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests if available
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<unknown>>) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data as T;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data as T;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data as T;
  }
}

export const api = new ApiClient();

// Auth API
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
  };
  token: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) => api.post<AuthResponse>('/auth/login', credentials),
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
};

// Books API
export interface Book {
  id: number;
  title: string;
  author: string | null;
  description: string | null;
  category: string | null;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: number;
  book_id: number;
  index: number;
  heading: string | null;
  text: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface BooksResponse {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnitsResponse {
  units: Unit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const booksApi = {
  getBooks: (page = 1, limit = 10, filters?: { author?: string; category?: string }) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters?.author) params.append('author', filters.author);
    if (filters?.category) params.append('category', filters.category);
    return api.get<BooksResponse>(`/books?${params.toString()}`);
  },
  getBook: (id: number) => api.get<Book>(`/books/${id}`),
  getBookUnits: (id: number, page = 1, limit = 50) =>
    api.get<UnitsResponse>(`/books/${id}/units?page=${page}&limit=${limit}`),
  getUnit: (unitId: number) => api.get<Unit>(`/books/units/${unitId}`),
  getUnitByBookAndIndex: (bookId: number, index: number) =>
    api.get<Unit>(`/books/${bookId}/unit?index=${index}`),
};

// Bookmarks API
export interface Bookmark {
  id: number;
  user_id: number;
  book_id: number;
  unit_id: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  book_title?: string;
  book_author?: string;
  unit_index?: number;
  heading?: string;
  text?: string;
}

export const bookmarksApi = {
  getBookmarks: (page = 1, limit = 20) =>
    api.get<Bookmark[]>(`/bookmarks?page=${page}&limit=${limit}`),
  getBookmarkByBook: (bookId: number) =>
    api.get<Bookmark | null>(`/bookmarks/book/${bookId}`),
  createBookmark: (bookId: number, unitId: number, notes?: string) =>
    api.post<Bookmark>('/bookmarks', { bookId, unitId, notes }),
  deleteBookmark: (bookId: number) =>
    api.delete<{ message: string }>(`/bookmarks/book/${bookId}`),
};

// TTS API
export const ttsApi = {
  getAudioUrl: (unitId: number) => `${API_URL}/api/v1/tts/unit/${unitId}`,
  getAudioStatus: (unitId: number) =>
    api.get<{ available: boolean; filePath?: string; fileSize?: number; provider?: string }>(
      `/tts/unit/${unitId}/status`
    ),
};

