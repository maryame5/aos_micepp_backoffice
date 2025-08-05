export interface ServiceRequest {
  id: string;
  userId: string;
  serviceId: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  comments: Comment[];
  dueDate?: Date;
}

export enum RequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export enum RequestPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  formFields: FormField[];
  requiredDocuments: string[];
}

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: any;
}