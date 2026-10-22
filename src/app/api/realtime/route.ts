import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

// Server-Sent Events untuk real-time updates
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const welcome = encoder.encode(`data: ${JSON.stringify({
        type: 'connected',
        message: 'Connected to CPA Lead Dashboard',
        timestamp: new Date().toISOString()
      })}\n\n`);
      controller.enqueue(welcome);
      
      let lastCheck = new Date();
      
      // Function to send new lead updates
      const sendLeadUpdate = async () => {
        try {
          // Get latest leads since last check
          const newLeads = await db.lead.findMany({
            where: {
              createdAt: {
                gte: lastCheck
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 10
          });
          
          // Send each new lead
          newLeads.forEach(lead => {
            const leadData = encoder.encode(`data: ${JSON.stringify({
              type: 'new_lead',
              lead: {
                id: lead.id,
                platform: lead.platform,
                payout: lead.payout,
                country: lead.country,
                createdAt: lead.createdAt
              },
              timestamp: new Date().toISOString()
            })}\n\n`);
            controller.enqueue(leadData);
          });
          
          // Update last check time
          if (newLeads.length > 0) {
            lastCheck = new Date();
          }
          
        } catch (error) {
          console.error('Error fetching new leads:', error);
        }
      };
      
      // Check for new leads every 2 seconds
      const interval = setInterval(sendLeadUpdate, 2000);
      
      // Send periodic ping to keep connection alive
      const pingInterval = setInterval(() => {
        const ping = encoder.encode(`data: ${JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        })}\n\n`);
        controller.enqueue(ping);
      }, 30000);
      
      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        clearInterval(pingInterval);
        console.log('SSE client disconnected');
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
  });
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control'
    }
  });
}