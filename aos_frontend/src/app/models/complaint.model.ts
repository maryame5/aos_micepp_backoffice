export interface Complaint {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: RequestPriority;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolution?: string;
  resolvedAt?: Date;
  attachments: Document[];
}

export enum ComplaintStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}