export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  profilePicture?: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  AGENT = 'AGENT'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  firstName: string;
  lastName: string;
  token: string;
  userType: UserRole;
  email: string;
  mustChangePassword: boolean;

  
}
export interface Userr {
  email: string;
  role: UserRole;
}

export interface ChangePasswordRequest {

  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}