export type AdminTab = 
  | "KPI_ANALYTICS" 
  | "KYC_VERIFICATION" 
  | "DISPUTE_MANAGEMENT" 
  | "USER_MANAGEMENT" 
  | "PLATFORM_SETTINGS" 
  | "REPORTS_EXPORTS";

export interface PendingProvider {
  id: string;
  name: string;
  category: string;
  license: string;
  documentName: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "INFO_REQUESTED";
  appliedDate: string;
}

export interface DisputeTicket {
  id: string;
  taskId: string;
  clientName: string;
  providerName: string;
  title: string;
  description: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  relativeTime: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "PROVIDER";
  status: "ACTIVE" | "SUSPENDED" | "VERIFYING";
  joinedDate: string;
  rating?: number;
  completedJobs?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  unread: boolean;
  type: "KYC" | "DISPUTE" | "SYSTEM";
}
