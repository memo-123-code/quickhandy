/**
 * Defines the core database schema models for the QuickHandy platform.
 * Backend developers should use these exact shapes when structuring
 * the API responses and database tables.
 */

export enum BookingStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum Role {
  CLIENT = "CLIENT",
  PROVIDER = "PROVIDER",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  walletBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Provider extends User {
  serviceCategory: string;
  rating: number;
  completedJobs: number;
  isVerified: boolean;
  locationLat?: number;
  locationLng?: number;
  isOnline: boolean;
}

export interface Booking {
  id: string;
  clientId: string;
  providerId?: string;
  serviceType: string;
  status: BookingStatus;
  description: string;
  locationLat: number;
  locationLng: number;
  address: string;
  price?: number;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: "TOP_UP" | "WITHDRAWAL" | "PAYMENT" | "COMMISSION";
  status: "PENDING" | "COMPLETED" | "FAILED";
  referenceId?: string; // e.g., Booking ID or Stripe Payment Intent
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  providerId: string;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: string;
}
