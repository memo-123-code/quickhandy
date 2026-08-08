import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (userId?: string, role?: 'CLIENT' | 'PROVIDER'): Socket => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    
    socket = io(socketUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: {
        userId: userId || "",
        role: role || "",
      }
    });
  }
  return socket;
};

export const connectSocket = (userId: string, role: 'CLIENT' | 'PROVIDER') => {
  const instance = getSocket(userId, role);
  if (!instance.connected) {
    // Set query params dynamically before connecting
    instance.io.opts.query = { userId, role };
    instance.connect();
    console.log(`[Socket] Connecting for user ${userId} as ${role}...`);
  }
  return instance;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    console.log("[Socket] Disconnected.");
  }
};

/**
 * WebSocket Tracking Event Guidelines:
 * 
 * 1. Provider location update (from Provider Dashboard):
 *    socket.emit("provider:location_update", { latitude, longitude, taskId })
 * 
 * 2. Join task tracking room (from both Client & Provider):
 *    socket.emit("task:join_room", { taskId })
 * 
 * 3. Client receives real-time provider location:
 *    socket.on("provider:location_changed", (coords: { latitude: number, longitude: number }) => { ... })
 * 
 * 4. Provider receives incoming job request:
 *    socket.on("task:new_request", (taskDetails: any) => { ... })
 */
