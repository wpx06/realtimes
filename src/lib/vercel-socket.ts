// Vercel-compatible real-time solution using Server-Sent Events
import { NextRequest } from 'next/server';

export class SSEManager {
  private connections: Map<string, Response> = new Map();

  addConnection(id: string, response: Response) {
    this.connections.set(id, response);
  }

  removeConnection(id: string) {
    this.connections.delete(id);
  }

  broadcast(data: any) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    
    this.connections.forEach((response, id) => {
      try {
        response.body?.write(message);
      } catch (error) {
        this.connections.delete(id);
      }
    });
  }
}

export const sseManager = new SSEManager();

// SSE endpoint for real-time updates
export async function GET(request: NextRequest) {
  const id = Math.random().toString(36).substring(7);
  
  const response = new Response(
    new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        // Send initial connection message
        const welcome = encoder.encode(`data: ${JSON.stringify({
          type: 'connected',
          message: 'Connected to CPA Lead Dashboard',
          timestamp: new Date().toISOString()
        })}\n\n`);
        controller.enqueue(welcome);
        
        // Keep connection alive
        const heartbeat = setInterval(() => {
          try {
            const ping = encoder.encode(`data: ${JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString()
            })}\n\n`);
            controller.enqueue(ping);
          } catch (error) {
            clearInterval(heartbeat);
          }
        }, 30000);
        
        // Cleanup on disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
          sseManager.removeConnection(id);
        });
      }
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    }
  );
  
  sseManager.addConnection(id, response);
  return response;
}