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

  /**
   * Get all plots with pagination
   */
  getAllPlots: async (params?: {
    page?: number;
    limit?: number;
    rsNumberId?: string;
    status?: PlotStatus;
    isActive?: boolean;
  }): Promise<ApiResponse<Plot[]>> => {
    const response = await apiClient.get<ApiResponse<Plot[]>>('/land/plots', { params });
    return response.data;
  },
};

/**
 * ========================================
 * Phase 3: Sales, Installments, Receipts Types
 * ========================================
 */

export enum SaleStageStatus {
  PENDING = 'Pending',
  PARTIAL = 'Partial',
  COMPLETED = 'Completed',
  OVERDUE = 'Overdue',
}

export enum SaleStatus {
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  ON_HOLD = 'On Hold',
}

export enum PaymentMethod {
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank Transfer',
  CHEQUE = 'Cheque',
  PDC = 'PDC',
  MOBILE_WALLET = 'Mobile Wallet',
}

export interface SaleStage {
  _id: string;
  stageName: string;
  plannedAmount: number;
  receivedAmount: number;
  dueAmount: number;
  status: SaleStageStatus;
  expectedDate?: string;
  completedDate?: string;
  notes?: string;
}

export interface Sale {
  _id: string;
  saleNumber: string;
  clientId: string | Client;
  plotId: string | Plot;
  rsNumberId: string | RSNumber;
  totalPrice: number;
  paidAmount: number;
  dueAmount: number;
  saleDate: string;
  status: SaleStatus;
  stages: SaleStage[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum InstallmentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  PARTIAL = 'Partial',
  MISSED = 'Missed',
}

export enum InstallmentFrequency {
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  HALF_YEARLY = 'Half-Yearly',
  YEARLY = 'Yearly',
  CUSTOM = 'Custom',
}

export interface InstallmentSchedule {
  _id: string;
  saleId: string | Sale;
  clientId: string | Client;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  paidDate?: string;
  status: InstallmentStatus;
  paymentMethod?: string;
  paymentId?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum ReceiptApprovalStatus {
  DRAFT = 'Draft',
  PENDING_ACCOUNTS = 'Pending Accounts',
  PENDING_HOF = 'Pending HOF',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum ReceiptType {
  BOOKING = 'Booking',
  INSTALLMENT = 'Installment',
  REGISTRATION = 'Registration',
  HANDOVER = 'Handover',
  OTHER = 'Other',
}

export interface InstrumentDetails {
  bankName?: string;
  branchName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  accountNumber?: string;
}

export interface ApprovalHistory {
  _id: string;
  approvedBy: string | User;
  approvalLevel: string;
  approvedAt: string;
  action: 'Approved' | 'Rejected';
  remarks?: string;
}

export interface Receipt {
  _id: string;
  receiptNumber: string;
  clientId: string | Client;
  saleId: string | Sale;
  stageId?: string;
  installmentId?: string | InstallmentSchedule;
  receiptType: ReceiptType;
  amount: number;
  method: PaymentMethod;
  receiptDate: string;
  instrumentDetails?: InstrumentDetails;
  approvalStatus: ReceiptApprovalStatus;
  approvalHistory: ApprovalHistory[];
  postedToLedger: boolean;
  ledgerPostingDate?: string;
  notes?: string;
  createdBy: string | User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * ========================================
 * Sales API Methods
 * ========================================
 */

export const salesApi = {
  /**
   * Get all sales with pagination
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: SaleStatus;
    clientId?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<Sale[]>> => {
    const response = await apiClient.get<ApiResponse<Sale[]>>('/sales', { params });
    return response.data;
  },

  /**
   * Get sale by ID
   */
  getById: async (id: string): Promise<Sale> => {
    const response = await apiClient.get<ApiResponse<Sale>>(`/sales/${id}`);
    return response.data.data!;
  },

  /**
   * Create new sale
   */
  create: async (data: {
    clientId: string;
    plotId: string;
    totalPrice: number;
    saleDate?: string;
    stages?: Partial<SaleStage>[];
    notes?: string;
  }): Promise<Sale> => {
    const response = await apiClient.post<ApiResponse<Sale>>('/sales', data);
    return response.data.data!;
  },

  /**
   * Update sale
   */
  update: async (id: string, data: Partial<Sale>): Promise<Sale> => {
    const response = await apiClient.put<ApiResponse<Sale>>(`/sales/${id}`, data);
    return response.data.data!;
  },

  /**
   * Update sale stage
   */
  updateStage: async (
    saleId: string,
    stageId: string,
    data: { receivedAmount?: number; notes?: string }
  ): Promise<Sale> => {
    const response = await apiClient.put<ApiResponse<Sale>>(
      `/sales/${saleId}/stages/${stageId}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete sale
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/sales/${id}`);
  },

  /**
   * Get sales statistics
   */
  getStats: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/sales/stats');
    return response.data.data!;
  },
};

/**
 * ========================================
 * Installments API Methods
 * ========================================
 */

export const installmentsApi = {
  /**
   * Create installment schedule
   */
  createSchedule: async (data: {
    saleId: string;
    totalAmount: number;
    numberOfInstallments: number;
    frequency?: InstallmentFrequency;
    startDate?: string;
  }): Promise<InstallmentSchedule[]> => {
    const response = await apiClient.post<ApiResponse<InstallmentSchedule[]>>(
      '/installments/schedule',
      data
    );
    return response.data.data!;
  },

  /**
   * Get all installments with pagination
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: InstallmentStatus;
    saleId?: string;
    clientId?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<InstallmentSchedule[]>> => {
    const response = await apiClient.get<ApiResponse<InstallmentSchedule[]>>('/installments', {
      params,
    });
    return response.data;
  },

  /**
   * Get installment by ID
   */
  getById: async (id: string): Promise<InstallmentSchedule> => {
    const response = await apiClient.get<ApiResponse<InstallmentSchedule>>(
      `/installments/${id}`
    );
    return response.data.data!;
  },

  /**
   * Update installment (mark as paid)
   */
  update: async (
    id: string,
    data: {
      paidAmount?: number;
      paidDate?: string;
      paymentMethod?: string;
      paymentId?: string;
      notes?: string;
    }
  ): Promise<InstallmentSchedule> => {
    const response = await apiClient.put<ApiResponse<InstallmentSchedule>>(
      `/installments/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Get overdue installments
   */
  getOverdue: async (clientId?: string): Promise<InstallmentSchedule[]> => {
    const response = await apiClient.get<ApiResponse<InstallmentSchedule[]>>(
      '/installments/overdue',
      { params: { clientId } }
    );
    return response.data.data!;
  },

  /**
   * Get client statement
   */
  getClientStatement: async (
    clientId: string
  ): Promise<{
    installments: InstallmentSchedule[];
    summary: {
      totalInstallments: number;
      paidCount: number;
      overdueCount: number;
      totalDue: number;
      totalPaid: number;
      totalOutstanding: number;
    };
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        installments: InstallmentSchedule[];
        summary: any;
      }>
    >(`/installments/client/${clientId}/statement`);
    return response.data.data!;
  },

  /**
   * Delete installment
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/installments/${id}`);
  },
};

/**
 * ========================================
 * Receipts API Methods
 * ========================================
 */

export const receiptsApi = {
  /**
   * Create receipt
   */
  create: async (data: {
    clientId: string;
    saleId: string;
    stageId?: string;
    installmentId?: string;
    receiptType: ReceiptType;
    amount: number;
    method: PaymentMethod;
    receiptDate?: string;
    instrumentDetails?: InstrumentDetails;
    notes?: string;
  }): Promise<Receipt> => {
    const response = await apiClient.post<ApiResponse<Receipt>>('/receipts', data);
    return response.data.data!;
  },

  /**
   * Get all receipts with pagination
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    approvalStatus?: ReceiptApprovalStatus;
    clientId?: string;
    saleId?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<Receipt[]>> => {
    const response = await apiClient.get<ApiResponse<Receipt[]>>('/receipts', { params });
    return response.data;
  },

  /**
   * Get receipt by ID
   */
  getById: async (id: string): Promise<Receipt> => {
    const response = await apiClient.get<ApiResponse<Receipt>>(`/receipts/${id}`);
    return response.data.data!;
  },

  /**
   * Submit receipt for approval
   */
  submit: async (id: string): Promise<Receipt> => {
    const response = await apiClient.post<ApiResponse<Receipt>>(`/receipts/${id}/submit`);
    return response.data.data!;
  },

  /**
   * Approve receipt
   */
  approve: async (id: string, remarks?: string): Promise<Receipt> => {
    const response = await apiClient.post<ApiResponse<Receipt>>(`/receipts/${id}/approve`, {
      remarks,
    });
    return response.data.data!;
  },

  /**
   * Reject receipt
   */
  reject: async (id: string, remarks: string): Promise<Receipt> => {
    const response = await apiClient.post<ApiResponse<Receipt>>(`/receipts/${id}/reject`, {
      remarks,
    });
    return response.data.data!;
  },

  /**
   * Get approval queue (role-based)
   */
  getApprovalQueue: async (): Promise<Receipt[]> => {
    const response = await apiClient.get<ApiResponse<Receipt[]>>('/receipts/approval-queue');
    return response.data.data!;
  },

  /**
   * Delete receipt (draft only)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/receipts/${id}`);
  },
};

/**
 * ========================================
 * PHASE 4: Expenses & Payroll Types
 * ========================================
 */

/**
 * Expense Category Types
 */
export interface ExpenseCategory {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

/**
 * Expense Types
 */
export enum ExpenseStatus {
  DRAFT = 'Draft',
  PENDING_ACCOUNTS = 'Pending Accounts',
  PENDING_HOF = 'Pending HOF',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface ApprovalHistoryEntry {
  approvedBy: string | User;
  approvedAt: string;
  remarks?: string;
  action: 'Approved' | 'Rejected';
}

export interface Expense {
  _id: string;
  expenseNumber: string;
  categoryId: string | ExpenseCategory;
  amount: number;
  expenseDate: string;
  vendor?: string;
  description: string;
  paymentMethod: PaymentMethod;
  instrumentDetails?: InstrumentDetails;
  status: ExpenseStatus;
  approvalHistory: ApprovalHistoryEntry[];
  receiptAttachment?: string;
  notes?: string;
  isActive: boolean;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

/**
 * Employee Types
 */
export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface Employee {
  _id: string;
  name: string;
  designation: string;
  phone: string;
  email?: string;
  nid?: string;
  address?: string;
  bankAccount?: BankAccount;
  joinDate: string;
  resignDate?: string;
  baseSalary: number;
  isActive: boolean;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

/**
 * Employee Cost Types
 */
export interface EmployeeCost {
  _id: string;
  employeeId: string | Employee;
  month: number;
  year: number;
  salary: number;
  commission: number;
  fuel: number;
  entertainment: number;
  advances: number;
  deductions: number;
  bonus: number;
  overtime: number;
  otherAllowances: number;
  netPay: number;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
  isActive: boolean;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

/**
 * ========================================
 * Expense Categories API Methods
 * ========================================
 */

export const expenseCategoryApi = {
  /**
   * Get all expense categories
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<ExpenseCategory[]>> => {
    const response = await apiClient.get<ApiResponse<ExpenseCategory[]>>(
      '/expense-categories',
      { params }
    );
    return response.data;
  },

  /**
   * Get expense category by ID
   */
  getById: async (id: string): Promise<ExpenseCategory> => {
    const response = await apiClient.get<ApiResponse<ExpenseCategory>>(
      `/expense-categories/${id}`
    );
    return response.data.data!;
  },

  /**
   * Create expense category
   */
  create: async (data: {
    name: string;
    description?: string;
  }): Promise<ExpenseCategory> => {
    const response = await apiClient.post<ApiResponse<ExpenseCategory>>(
      '/expense-categories',
      data
    );
    return response.data.data!;
  },

  /**
   * Update expense category
   */
  update: async (
    id: string,
    data: Partial<{ name: string; description: string; isActive: boolean }>
  ): Promise<ExpenseCategory> => {
    const response = await apiClient.put<ApiResponse<ExpenseCategory>>(
      `/expense-categories/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete expense category
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/expense-categories/${id}`);
  },
};

/**
 * ========================================
 * Expenses API Methods
 * ========================================
 */

export const expensesApi = {
  /**
   * Get all expenses
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: ExpenseStatus;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<Expense[]>> => {
    const response = await apiClient.get<ApiResponse<Expense[]>>('/expenses', { params });
    return response.data;
  },

  /**
   * Get expense by ID
   */
  getById: async (id: string): Promise<Expense> => {
    const response = await apiClient.get<ApiResponse<Expense>>(`/expenses/${id}`);
    return response.data.data!;
  },

  /**
   * Create expense
   */
  create: async (data: {
    categoryId: string;
    amount: number;
    expenseDate?: string;
    vendor?: string;
    description: string;
    paymentMethod: PaymentMethod;
    instrumentDetails?: InstrumentDetails;
    notes?: string;
  }): Promise<Expense> => {
    const response = await apiClient.post<ApiResponse<Expense>>('/expenses', data);
    return response.data.data!;
  },

  /**
   * Update expense (draft only)
   */
  update: async (id: string, data: Partial<Expense>): Promise<Expense> => {
    const response = await apiClient.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
    return response.data.data!;
  },

  /**
   * Submit expense for approval
   */
  submit: async (id: string): Promise<Expense> => {
    const response = await apiClient.post<ApiResponse<Expense>>(`/expenses/${id}/submit`);
    return response.data.data!;
  },

  /**
   * Approve expense
   */
  approve: async (id: string, remarks?: string): Promise<Expense> => {
    const response = await apiClient.post<ApiResponse<Expense>>(`/expenses/${id}/approve`, {
      remarks,
    });
    return response.data.data!;
  },

  /**
   * Reject expense
   */
  reject: async (id: string, remarks: string): Promise<Expense> => {
    const response = await apiClient.post<ApiResponse<Expense>>(`/expenses/${id}/reject`, {
      remarks,
    });
    return response.data.data!;
  },

  /**
   * Get approval queue (role-based)
   */
  getApprovalQueue: async (): Promise<Expense[]> => {
    const response = await apiClient.get<ApiResponse<Expense[]>>('/expenses/approval-queue');
    return response.data.data!;
  },

  /**
   * Delete expense (draft only)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },

  /**
   * Get expense statistics
   */
  getStats: async (params?: { startDate?: string; endDate?: string }): Promise<{
    totalExpenses: number;
    totalAmount: number;
    pendingApprovals: number;
    categoryBreakdown: Array<{
      categoryName: string;
      count: number;
      totalAmount: number;
    }>;
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        totalExpenses: number;
        totalAmount: number;
        pendingApprovals: number;
        categoryBreakdown: Array<{
          categoryName: string;
          count: number;
          totalAmount: number;
        }>;
      }>
    >('/expenses/stats', { params });
    return response.data.data!;
  },
};

/**
 * ========================================
 * Employees API Methods
 * ========================================
 */

export const employeesApi = {
  /**
   * Get all employees
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<Employee[]>> => {
    const response = await apiClient.get<ApiResponse<Employee[]>>('/employees', { params });
    return response.data;
  },

  /**
   * Get employee by ID
   */
  getById: async (id: string): Promise<Employee> => {
    const response = await apiClient.get<ApiResponse<Employee>>(`/employees/${id}`);
    return response.data.data!;
  },

  /**
   * Create employee
   */
  create: async (data: {
    name: string;
    designation: string;
    phone: string;
    email?: string;
    nid?: string;
    address?: string;
    bankAccount?: BankAccount;
    joinDate: string;
    baseSalary: number;
  }): Promise<Employee> => {
    const response = await apiClient.post<ApiResponse<Employee>>('/employees', data);
    return response.data.data!;
  },

  /**
   * Update employee
   */
  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.put<ApiResponse<Employee>>(`/employees/${id}`, data);
    return response.data.data!;
  },

  /**
   * Delete employee
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },

  /**
   * Get employee cost history
   */
  getCosts: async (
    employeeId: string,
    params?: { year?: number; month?: number }
  ): Promise<EmployeeCost[]> => {
    const response = await apiClient.get<ApiResponse<EmployeeCost[]>>(
      `/employees/${employeeId}/costs`,
      { params }
    );
    return response.data.data!;
  },

  /**
   * Get employee statistics
   */
  getStats: async (): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    currentMonthPayroll: number;
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        totalEmployees: number;
        activeEmployees: number;
        currentMonthPayroll: number;
      }>
    >('/employees/stats');
    return response.data.data!;
  },
};

/**
 * ========================================
 * Employee Costs API Methods
 * ========================================
 */

export const employeeCostsApi = {
  /**
   * Get all employee costs
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    employeeId?: string;
    year?: number;
    month?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<EmployeeCost[]>> => {
    const response = await apiClient.get<ApiResponse<EmployeeCost[]>>('/employee-costs', {
      params,
    });
    return response.data;
  },

  /**
   * Get employee cost by ID
   */
  getById: async (id: string): Promise<EmployeeCost> => {
    const response = await apiClient.get<ApiResponse<EmployeeCost>>(`/employee-costs/${id}`);
    return response.data.data!;
  },

  /**
   * Create employee cost entry
   */
  create: async (data: {
    employeeId: string;
    month: number;
    year: number;
    salary?: number;
    commission?: number;
    fuel?: number;
    entertainment?: number;
    advances?: number;
    deductions?: number;
    bonus?: number;
    overtime?: number;
    otherAllowances?: number;
    paymentDate?: string;
    paymentMethod?: string;
    notes?: string;
  }): Promise<EmployeeCost> => {
    const response = await apiClient.post<ApiResponse<EmployeeCost>>('/employee-costs', data);
    return response.data.data!;
  },

  /**
   * Update employee cost
   */
  update: async (id: string, data: Partial<EmployeeCost>): Promise<EmployeeCost> => {
    const response = await apiClient.put<ApiResponse<EmployeeCost>>(`/employee-costs/${id}`, data);
    return response.data.data!;
  },

  /**
   * Delete employee cost
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/employee-costs/${id}`);
  },

  /**
   * Get payroll summary for a month
   */
  getPayrollSummary: async (year: number, month: number): Promise<{
    totalEmployees: number;
    totalSalary: number;
    totalCommission: number;
    totalFuel: number;
    totalEntertainment: number;
    totalBonus: number;
    totalOvertime: number;
    totalOtherAllowances: number;
    totalAdvances: number;
    totalDeductions: number;
    totalNetPay: number;
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        totalEmployees: number;
        totalSalary: number;
        totalCommission: number;
        totalFuel: number;
        totalEntertainment: number;
        totalBonus: number;
        totalOvertime: number;
        totalOtherAllowances: number;
        totalAdvances: number;
        totalDeductions: number;
        totalNetPay: number;
      }>
    >('/employee-costs/payroll/summary', {
      params: { year, month },
    });
    return response.data.data!;
  },

  /**
   * Get employee cost statistics
   */
  getStats: async (): Promise<{
    currentMonth: {
      employeeCount: number;
      totalPayroll: number;
    };
    yearToDate: {
      totalPayroll: number;
    };
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        currentMonth: {
          employeeCount: number;
          totalPayroll: number;
        };
        yearToDate: {
          totalPayroll: number;
        };
      }>
    >('/employee-costs/stats');
    return response.data.data!;
  },
};

export default apiClient;
