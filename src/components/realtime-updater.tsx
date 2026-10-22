'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  platform: string;
  payout: number;
  country: string;
  createdAt: string;
}

export const RealtimeUpdater = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [totalToday, setTotalToday] = useState(0);

  useEffect(() => {
    const eventSource = new EventSource('/api/realtime');

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('🟢 Real-time connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'new_lead':
            const newLead = data.lead;
            
            // Update recent leads
            setRecentLeads(prev => [newLead, ...prev.slice(0, 4)]);
            
            // Update total
            setTotalToday(prev => prev + (newLead.payout || 0));
            
            // Show toast notification
            toast({
              title: "🎉 New Lead!",
              description: `${newLead.platform} - $${newLead.payout}`,
              duration: 3000,
            });
            
            // Play sound (optional)
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {}); // Ignore errors
            
            break;
            
          case 'connected':
            console.log('📡 Connected to real-time updates');
            break;
            
          case 'ping':
            // Keep connection alive
            break;
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.log('🔴 Real-time disconnected');
      
      // Auto-reconnect after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm font-medium">Real-time Updates</span>
            {isConnected && (
              <Badge variant="secondary" className="text-xs">
                LIVE
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-green-600">
              ${totalToday.toFixed(2)}
            </span>
          </div>
        </div>
        
        {recentLeads.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-muted-foreground">Recent Leads:</div>
            {recentLeads.map((lead, index) => (
              <div key={lead.id} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {lead.platform}
                  </Badge>
                  <span className="text-muted-foreground">
                    {lead.country || 'Unknown'}
                  </span>
                </div>
                <span className="font-bold text-green-600">
                  ${lead.payout?.toFixed(2) || '0.00'}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {!isConnected && (
          <div className="mt-3 text-xs text-red-600">
            ⚠️ Real-time disconnected. Attempting to reconnect...
          </div>
        )}
      </CardContent>
    </Card>
  );
};