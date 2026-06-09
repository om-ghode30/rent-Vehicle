import { io } from "socket.io-client";

const socket = io("https://rent-vehicle-zw86.onrender.com", {
  withCredentials: true,
});

export default socket;