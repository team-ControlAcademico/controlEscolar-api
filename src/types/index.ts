export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  user?: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  accessToken?: string;
  refreshToken?: string;
  errors?: { field: string; message: string }[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}
