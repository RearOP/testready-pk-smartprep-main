// api.ts
// API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Define API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'STUDENT' | 'ADMIN';
  profileCompleted?: boolean;
  createdAt: string;
  student?: {
    id: string;
    fullName: string;
    schoolName: string;
    age?: number;
    classGrade?: string;
    whatsappNumber?: string;
    consentWhatsapp: boolean;
    profileCompleted: boolean;
  };
  admin?: {
    id: string;
    fullName: string;
  };
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName: string;
  city: string;
  examType: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface GetMeResponse {
  user: User;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  timeLimit: number;
  isActive: boolean;
  createdAt: string;
  questions?: Question[];
  _count?: { // Make this optional
    questions: number;
    attempts?: number;
  };
}

export interface Question {
  id: string;
  text: string;
  options: Array<{ id: string; text: string }>; // Changed from string[] to object array
  correctAnswer: string;
  marks: number;
  explanation?: string;
}

export interface TestAttempt {
  id: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  startedAt: string;
  finishedAt?: string;
  answers: any[];
  test?: Test;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      ...this.getHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Important for cookies
      });

      // Handle 401 Unauthorized responses
      if (response.status === 401) {
        this.clearToken();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || 'Request failed';
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error - please check your connection');
    }
  }

  // Auth endpoints
  async register(data: RegisterData): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<ApiResponse<LoginResponse>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  // In your api.ts file
  async logout(): Promise<ApiResponse<void>> {
    try {
      // Try with empty body first
      const response = await this.request<ApiResponse<void>>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({}), // Some endpoints require an empty object
      });

      // Clear token regardless of API response
      this.clearToken();

      return response;
    } catch (error) {
      // If that fails, try without body
      try {
        const response = await this.request<ApiResponse<void>>('/auth/logout', {
          method: 'POST',
        });

        this.clearToken();
        return response;
      } catch (secondError) {
        // If both fail, just clear token locally
        this.clearToken();

        // Return a success response anyway
        return {
          success: true,
          message: 'Logged out locally',
          data: {} as any
        };
      }
    }
  }

  async getMe(): Promise<ApiResponse<GetMeResponse>> {
    return this.request<ApiResponse<GetMeResponse>>('/auth/me');
  }

  // Student endpoints
  async completeProfile(data: {
    schoolName: string;
    age: number;
    classGrade: string;
    whatsappNumber?: string;
    consentWhatsapp: boolean;
  }): Promise<ApiResponse<{ student: any }>> {
    return this.request<ApiResponse<{ student: any }>>('/student/profile/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<ApiResponse<{ student: any }>> {
    return this.request<ApiResponse<{ student: any }>>('/student/profile');
  }

  async updateProfile(data: {
    schoolName?: string;
    age?: number;
    classGrade?: string;
    whatsappNumber?: string;
    consentWhatsapp?: boolean;
  }): Promise<ApiResponse<{ student: any }>> {
    return this.request<ApiResponse<{ student: any }>>('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getProgress(): Promise<ApiResponse<{
    statistics: {
      totalTests: number;
      completedTests: number;
      averageScore: number;
      bestScore: number;
    };
    recentTests: any[];
    progressData: any[];
  }>> {
    // Try different endpoint patterns
    try {
      return await this.request<ApiResponse<{
        statistics: {
          totalTests: number;
          completedTests: number;
          averageScore: number;
          bestScore: number;
        };
        recentTests: any[];
        progressData: any[];
      }>>('/student/progress', {
        method: 'GET',
      });
    } catch (error) {
      // Fallback to another endpoint pattern
      return await this.request<ApiResponse<{
        statistics: {
          totalTests: number;
          completedTests: number;
          averageScore: number;
          bestScore: number;
        };
        recentTests: any[];
        progressData: any[];
      }>>('/students/progress', {
        method: 'GET',
      });
    }
  }

  // Test endpoints
  async getTests(): Promise<ApiResponse<{ tests: Test[] }>> {
    return this.request<ApiResponse<{ tests: Test[] }>>('/tests');
  }

  async getTest(testId: string): Promise<ApiResponse<{ test: Test }>> {
    return this.request<ApiResponse<{ test: Test }>>(`/tests/${testId}`);
  }

  async startTest(testId: string): Promise<ApiResponse<{
    attemptId: string;
    test: Test;
  }>> {
    return this.request<ApiResponse<{
      attemptId: string;
      test: Test;
    }>>(`/tests/${testId}/start`, {
      method: 'POST',
    });
  }

  async submitTest(attemptId: string, answers: Array<{ questionId: string; answer: string }>): Promise<ApiResponse<{
    attempt: TestAttempt;
    results: any[];
  }>> {
    return this.request<ApiResponse<{
      attempt: TestAttempt;
      results: any[];
    }>>('/tests/submit', {
      method: 'POST',
      body: JSON.stringify({ attemptId, answers }),
    });
  }

  async getTestHistory(): Promise<ApiResponse<{ history: TestAttempt[] }>> {
    return this.request<ApiResponse<{ history: TestAttempt[] }>>('/tests/history');
  }

  // Admin endpoints
  async getDashboardStats(): Promise<ApiResponse<{
    statistics: {
      totalStudents: number;
      totalTests: number;
      totalAttempts: number;
      completedAttempts: number;
      averageScore: number;
    };
    recentStudents: any[];
    recentAttempts: any[];
  }>> {
    return this.request<ApiResponse<{
      statistics: {
        totalStudents: number;
        totalTests: number;
        totalAttempts: number;
        completedAttempts: number;
        averageScore: number;
      };
      recentStudents: any[];
      recentAttempts: any[];
    }>>('/admin/dashboard');
  }

  async getStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    school?: string;
    classGrade?: string;
  }): Promise<ApiResponse<{
    students: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    return this.request<ApiResponse<{
      students: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>>(`/admin/students?${queryParams.toString()}`);
  }

  async exportStudents(): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/admin/students/export`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  async createTest(data: {
    title: string;
    description?: string;
    totalMarks: number;
    timeLimit: number;
    questions: Array<{
      text: string;
      options: Array<{ id: string; text: string }>; // Changed from string[] to object array
      correctAnswer: string;
      marks: number;
      explanation?: string;
    }>;
  }): Promise<ApiResponse<{ test: Test }>> {
    return this.request<ApiResponse<{ test: Test }>>('/admin/tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdminTests(): Promise<ApiResponse<{ tests: Test[] }>> {
    return this.request<ApiResponse<{ tests: Test[] }>>('/admin/tests');
  }

  async getTestsSingle(testId: string): Promise<ApiResponse<{ tests: Test }>> {
    return this.request<ApiResponse<{ tests: Test }>>(`/admin/tests/${testId}`);
  }


  // In api.ts, update the updateTest method signature:
  async updateTest(testId: string, data: {
    title?: string;
    description?: string;
    totalMarks?: number;
    timeLimit?: number;
    isActive?: boolean;
    questions?: Array<{
      id?: string;
      text: string;
      options: Array<{ id: string; text: string }>;
      correctAnswer: string;
      marks: number;
      explanation?: string;
    }>;
  }): Promise<ApiResponse<{ test: Test }>> {
    return this.request<ApiResponse<{ test: Test }>>(`/admin/tests/${testId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTest(testId: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/admin/tests/${testId}`, {
      method: 'DELETE',
    });
  }

  // WhatsApp endpoints
  async sendWhatsAppMessage(data: {
    studentId: string;
    message: string;
    type?: string;
  }): Promise<ApiResponse<{
    notificationId: string;
    messageSid: string;
    status: string;
  }>> {
    return this.request<ApiResponse<{
      notificationId: string;
      messageSid: string;
      status: string;
    }>>('/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendTestResultNotification(attemptId: string): Promise<ApiResponse<{
    messageSid: string;
    status: string;
  }>> {
    return this.request<ApiResponse<{
      messageSid: string;
      status: string;
    }>>(`/whatsapp/test-result/${attemptId}`, {
      method: 'POST',
    });
  }

  async getNotificationLogs(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<ApiResponse<{
    notifications: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    return this.request<ApiResponse<{
      notifications: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>>(`/whatsapp/logs?${queryParams.toString()}`);
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Re-export interfaces for convenience
export type { AuthContextType } from '@/contexts/AuthContext';

// Utility functions
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const maskWhatsAppNumber = (number: string): string => {
  if (!number) return '';
  return number.replace(/(\+\d{2})\d{4}(\d{3})/, '$1****$2');
};

// HTTP status code constants
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;