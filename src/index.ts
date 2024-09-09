    import WebSocket, { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;

// Create a WebSocket server
const wss = new WebSocketServer({ port: Number(PORT) });

// Event listener for when a client connects
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  // Listen for messages from the client
  ws.on('message', (message: string) => {
    console.log(`Received message: ${message}`);
    
    // Echo the message back to the client
    ws.send(`Server received: ${message}`);
  });

  // Handle when the client disconnects
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);