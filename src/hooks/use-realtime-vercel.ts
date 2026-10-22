// Vercel-compatible real-time hook using Server-Sent Events
import { useEffect, useState, useCallback } from 'react';

interface LeadData {
  id: string;
  platform: string;
  payout: number;
  country: string;
  createdAt: string;
}

interface RealtimeMessage {
  type: 'connected' | 'ping' | 'new_lead' | 'update';
  data?: LeadData;
  message?: string;
  timestamp: string;
}

export const useRealtimeVercel = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/realtime');

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log('Connected to real-time updates');
    };

    eventSource.onmessage = (event) => {
      try {
        const message: RealtimeMessage = JSON.parse(event.data);
        setLastMessage(message);
        
        if (message.type === 'new_lead') {
          // Trigger refresh or update UI
          window.dispatchEvent(new CustomEvent('newLead', { 
            detail: message.data 
          }));
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError('Connection lost');
      console.log('Real-time connection error');
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  const sendNotification = useCallback((data: any) => {
    // For Vercel, we'll use a different approach
    // This would typically be handled by the API routes
    console.log('Sending notification:', data);
  }, []);

  return {
    isConnected,
    lastMessage,
    error,
    sendNotification
  };
};