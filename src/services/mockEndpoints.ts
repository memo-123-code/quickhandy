import { Booking, Transaction } from "../types/models";

// Utility to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockEndpoints = {
  // === Provider / Admin Dashboard ===
  getWalletBalance: async (userId: string): Promise<number> => {
    await delay(500);
    // Return dummy data (e.g., 50.00 for provider prepaid wallet, or 1250 for client)
    return userId.startsWith("provider") ? 50.00 : 1250.00;
  },

  getAdminStats: async () => {
    await delay(500);
    return {
      activeClients: 2452,
      verifiedProviders: 318,
      activeBookings: 18,
      todaysCommission: 340.5,
    };
  },

  // === Live Dispatch ===
  getLiveDispatchCoordinates: async (bookingId: string) => {
    await delay(500);
    return {
      clientLocation: { lat: 30.3015, lng: 31.7406 }, // Zagazig default
      providerLocation: { lat: 30.3050, lng: 31.7450 },
      etaMinutes: 3,
      providerName: "Ahmed Sobhy",
      providerRating: 4.96
    };
  },

  // === Bookings ===
  getActiveBookings: async (userId: string): Promise<Booking[]> => {
    await delay(500);
    return [
      {
        id: "BKG-1029",
        clientId: "client-1",
        providerId: "provider-1",
        serviceType: "Plumbing",
        status: "IN_PROGRESS" as any,
        description: "Fix leaking pipe in the bathroom.",
        locationLat: 30.3015,
        locationLng: 31.7406,
        address: "El-Gamaa St, Zagazig",
        price: 150,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
  },

  // === Transactions ===
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    await delay(500);
    return [
      {
        id: "TXN-8812",
        userId,
        amount: 50.00,
        type: "TOP_UP",
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
      }
    ];
  }
};
