import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * User Types
 */
export enum UserRole {
  ADMIN = 'Admin',
  ACCOUNT_MANAGER = 'AccountManager',
  HOF = 'HOF',
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * API Client Configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Create Axios Instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Adds authentication token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles token refresh and error responses
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

        if (!refreshToken) {
          // No refresh token, redirect to login
          if (typeof window !== 'undefined') {
            localStorage.clear();
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        // Try to refresh token
        const response = await axios.post<ApiResponse<LoginResponse>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        if (response.data.success && response.data.data) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Store new tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API Service Methods
 */
export const authApi = {
  /**
   * Login
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data.data!;
  },

  /**
   * Register (Admin only)
   */
  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', userData);
    return response.data.data!;
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * Get Current User Profile
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  },

  /**
   * Get All Users (Admin only)
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>('/auth/users');
    return response.data.data!;
  },

  /**
   * Update User (Admin only)
   */
  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/auth/users/${id}`, updates);
    return response.data.data!;
  },

  /**
   * Delete User (Admin only)
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/auth/users/${id}`);
  },

  /**
   * Refresh Token
   */
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data!;
  },
};

/**
 * ========================================
 * Phase 2: Client & Land Types
 * ========================================
 */

export interface Client {
  _id: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address: string;
  nid?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UnitType {
  ACRE = 'Acre',
  KATHA = 'Katha',
  SQFT = 'Sq Ft',
  DECIMAL = 'Decimal',
  BIGHA = 'Bigha',
}

export interface RSNumber {
  _id: string;
  rsNumber: string;
  projectName: string;
  location: string;
  totalArea: number;
  unitType: UnitType;
  soldArea: number;
  allocatedArea: number;
  remainingArea: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum PlotStatus {
  AVAILABLE = 'Available',
  RESERVED = 'Reserved',
  SOLD = 'Sold',
  BLOCKED = 'Blocked',
}

export interface Plot {
  _id: string;
  plotNumber: string;
  rsNumberId: string | RSNumber;
  area: number;
  unitType: UnitType;
  status: PlotStatus;
  clientId?: string | Client;
  reservationDate?: string;
  saleDate?: string;
  price?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * ========================================
 * Client API Methods
 * ========================================
 */

export const clientApi = {
  /**
   * Get all clients with pagination
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<Client[]>> => {
    const response = await apiClient.get<ApiResponse<Client[]>>('/clients', { params });
    return response.data;
  },

  /**
   * Get client by ID
   */
  getById: async (id: string): Promise<Client> => {
    const response = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data.data!;
  },

  /**
   * Create new client
   */
  create: async (data: Partial<Client>): Promise<Client> => {
    const response = await apiClient.post<ApiResponse<Client>>('/clients', data);
    return response.data.data!;
  },

  /**
   * Update client
   */
  update: async (id: string, data: Partial<Client>): Promise<Client> => {
    const response = await apiClient.put<ApiResponse<Client>>(`/clients/${id}`, data);
    return response.data.data!;
  },

  /**
   * Delete client
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },

  /**
   * Search clients
   */
  search: async (query: string): Promise<Client[]> => {
    const response = await apiClient.get<ApiResponse<Client[]>>('/clients/search', {
      params: { q: query },
    });
    return response.data.data!;
  },

  /**
   * Get client statistics
   */
  getStats: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/clients/stats');
    return response.data.data!;
  },
};

/**
 * ========================================
 * Land API Methods (RS Numbers & Plots)
 * ========================================
 */

export const landApi = {
  /**
   * RS Number methods
   */
  rsNumbers: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      projectName?: string;
      isActive?: boolean;
    }): Promise<ApiResponse<RSNumber[]>> => {
      const response = await apiClient.get<ApiResponse<RSNumber[]>>('/land/rs-numbers', {
        params,
      });
      return response.data;
    },

    getById: async (id: string): Promise<any> => {
      const response = await apiClient.get<ApiResponse<any>>(`/land/rs-numbers/${id}`);
      return response.data.data!;
    },

    create: async (data: Partial<RSNumber>): Promise<RSNumber> => {
      const response = await apiClient.post<ApiResponse<RSNumber>>('/land/rs-numbers', data);
      return response.data.data!;
    },

    update: async (id: string, data: Partial<RSNumber>): Promise<RSNumber> => {
      const response = await apiClient.put<ApiResponse<RSNumber>>(
        `/land/rs-numbers/${id}`,
        data
      );
      return response.data.data!;
    },

    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/land/rs-numbers/${id}`);
    },
  },

  /**
   * Plot methods
   */
  plots: {
    getByRSNumber: async (rsNumberId: string): Promise<Plot[]> => {
      const response = await apiClient.get<ApiResponse<Plot[]>>(
        `/land/plots/rs-number/${rsNumberId}`
      );
      return response.data.data!;
    },

    getById: async (id: string): Promise<Plot> => {
      const response = await apiClient.get<ApiResponse<Plot>>(`/land/plots/${id}`);
      return response.data.data!;
    },

    create: async (data: Partial<Plot>): Promise<Plot> => {
      const response = await apiClient.post<ApiResponse<Plot>>('/land/plots', data);
      return response.data.data!;
    },

    update: async (id: string, data: Partial<Plot>): Promise<Plot> => {
      const response = await apiClient.put<ApiResponse<Plot>>(`/land/plots/${id}`, data);
      return response.data.data!;
    },

    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/land/plots/${id}`);
    },
  },

  /**
   * Get land statistics
   */
  getStats: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/land/stats');
    return response.data.data!;
  },
};

export default apiClient;
