/**
 * apiMock.ts
 * Centralized Mock API Service
 * 
 * This file acts as the abstraction layer for all API calls.
 * To transition to a real backend, simply replace these functions
 * with real `fetch` or `axios` calls pointing to your backend URL.
 */

// Simulates network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiMock = {
  // === AUTHENTICATION ===
  login: async (credentials: any) => {
    await delay(1500);
    if (!credentials.email || !credentials.password) throw new Error("Missing credentials");
    return { token: "mock-jwt-token-123", user: { id: "1", role: "CLIENT", email: credentials.email } };
  },

  register: async (data: any) => {
    await delay(1500);
    if (!data.email || !data.password) throw new Error("Missing required fields");
    return { token: "mock-jwt-token-123", user: { id: "1", ...data } };
  },

  // === ADMIN ENDPOINTS ===
  fetchDashboardStats: async () => {
    await delay(1000);
    return {
      activeClients: 2452,
      verifiedProviders: 318,
      activeBookings: 18,
      todaysCommission: 340.50
    };
  },

  approveKYC: async (providerId: string) => {
    await delay(1000);
    return { success: true, providerId, status: "APPROVED" };
  },

  rejectKYC: async (providerId: string) => {
    await delay(1000);
    return { success: true, providerId, status: "REJECTED" };
  },

  requestInfoKYC: async (providerId: string) => {
    await delay(1000);
    return { success: true, providerId, status: "INFO_REQUESTED" };
  },

  resolveDispute: async (disputeId: string) => {
    await delay(1000);
    return { success: true, disputeId, status: "RESOLVED" };
  },

  // === CLIENT ENDPOINTS ===
  updateClientProfile: async (data: any) => {
    await delay(1200);
    return { success: true, data };
  },

  processTopUp: async (amount: number, methodId: string) => {
    await delay(1500);
    return { success: true, newBalance: 1250.00 + amount, transactionId: "TXN-" + Math.random().toString(36).substring(7) };
  },

  submitReview: async (workerId: string, rating: number, comment: string) => {
    await delay(1000);
    return { success: true, workerId, rating };
  },

  bookService: async (serviceType: string, details: any) => {
    await delay(2000);
    return { success: true, bookingId: "BKG-" + Math.random().toString(36).substring(7), status: "PENDING" };
  },

  // === PROVIDER ENDPOINTS ===
  updateProviderProfile: async (data: any) => {
    await delay(1200);
    return { success: true, data };
  },

  processWithdrawal: async (amount: number, method: string) => {
    await delay(1500);
    return { success: true, withdrawnAmount: amount, method };
  },

  acceptJob: async (jobId: string) => {
    await delay(1000);
    return { success: true, jobId, status: "ACCEPTED" };
  }
};
