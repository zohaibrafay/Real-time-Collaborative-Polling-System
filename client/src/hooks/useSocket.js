import { io } from 'socket.io-client';

// Single instance
const socket = io('http://localhost:3001', {
  autoConnect: true
});

export const useSocket = () => {
  return socket;
};
