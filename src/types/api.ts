export type Role = "ADMIN" | "PROVIDER" | "CLIENT" | "SUPPORT";
export type KYCStatus = "PENDING" | "APPROVED" | "REJECTED" | "INFO_REQUESTED";
export type DisputeStatus = "OPEN" | "RESOLVED" | "UNDER_REVIEW";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  createdAt: string;
}

export interface AdminUser extends User {
  role: "ADMIN";
  permissions: string[];
}

export interface Provider extends User {
  role: "PROVIDER";
  nationalId: string;
  kycStatus: KYCStatus;
  rating: number;
  reviewsCount: number;
  completedJobs: number;
  walletBalance: number;
  lifetimeRevenue: number;
}

export interface KYCRequest {
  id: string;
  providerId: string;
  providerName: string;
  status: KYCStatus;
  documents: {
    nationalId?: string;
    criminalRecord?: string;
    certificates?: string;
  };
  submittedAt: string;
  updatedAt: string;
}

export interface DisputeTicket {
  id: string;
  jobId: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  reason: string;
  status: DisputeStatus;
  createdAt: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
