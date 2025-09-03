export interface User {
  phone: String;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  
  address?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDTO {
  id: number;
  username: string;
  firstname:String;
  lastname:String
  email: string;
  role: string;
  department:String;
  usingTemporaryPassword: boolean;
  phone: string;
  cin: string;
  matricule: string;
}


export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  SUPPORT = 'ROLE_SUPPORT',
  AGENT = 'ROLE_AGENT'
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