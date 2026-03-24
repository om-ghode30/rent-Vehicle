import { io } from "socket.io-client";

const BASE_URL = "https://55f5-2409-40c2-100d-5b-6409-ce33-fd08-9cca.ngrok-free.app";

export const socket = io(BASE_URL, {
  transports: ["websocket"],
   withCredentials: true,
});