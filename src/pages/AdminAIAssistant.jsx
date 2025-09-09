import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bot, LineChart, SlidersHorizontal, Settings } from 'lucide-react';
import { AIConversation } from '@/api/entities';
import { User } from '@/api/entities';
import { Organization } from '@/api/entities';

import AIInsightsSummary from '@/components/admin/ai/AIInsightsSummary';
import ConversationHistory from '@/components/admin/ai/ConversationHistory';
import ConversationViewer from '@/components/admin/ai/ConversationViewer';
import IntegrationsPanel from '@/components/admin/ai/IntegrationsPanel';
import UsageGuide from '@/components/admin/ai/UsageGuide';

// Expanded mock data to support the new dashboard
const generateMockConversations = () => {
    const users = [
        { id: 'user1', name: 'John Smith', org: 'Retail Corp' },
        { id: 'user2', name: 'Sarah Johnson', org: 'Health Inc.' },
        { id: 'user3', name: 'Mike Chen', org: 'Manufacturing LLC' },
        { id: 'user4', name: 'Emily White', org: 'Retail Corp' },
    ];
    
    const topics = [
        "Search for critical events today",
        "How many tasks are overdue?",
        "List all safety violations from last week",
        "Camera offline in warehouse",
        "Find person detected events in parking lot",
    ];

    const messages = [
        { role: 'user', content: 'Show me all high priority events from yesterday?', timestamp: new Date(Date.now() - 86500000) },
        { role: 'assistant', content: 'Of course. I found 3 high-priority events from yesterday. [View Details](/Events?severity=high)', timestamp: new Date(Date.now() - 86450000) },
    ];
    
    return Array.from({ length: 15 }).map((_, i) => {
        const user = users[i % users.length];
        const lastMessageTime = new Date(Date.now() - (i * 3600000 * Math.random() * 5));
        return {
            id: `convo_${i+1}`,
            user_id: user.id,
            user_name: user.name,
            organization_name: user.org,
            organization_id: `org_${i % 2}`,
            last_message_at: lastMessageTime.toISOString(),
            created_date: new Date(lastMessageTime.getTime() - 100000).toISOString(),
            message_count: Math.floor(Math.random() * 15) + 2,
            summary_topic: topics[i % topics.length],
            conversation_context: ['events', 'tasks', 'dashboard'][i % 3],
            messages: messages,
            is_flagged: Math.random() > 0.9,
            user_feedback_rating: Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 3 : null,
        }
    });
};


export default function AdminAIAssistant() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      // Using enhanced mock data for demonstration
      const mockData = generateMockConversations().sort((a,b) => new Date(b.last_message_at) - new Date(a.last_message_at));
      setConversations(mockData);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Bot className="w-8 h-8 text-blue-600" />
          AI Assistant Dashboard
        </h1>
        <p className="text-slate-600 mt-1">Monitor, analyze, and manage your AI assistant's performance.</p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LineChart className="w-4 h-4"/> Dashboard
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4"/> Conversation Explorer
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4"/> Settings & Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <AIInsightsSummary conversations={conversations} />
        </TabsContent>

        <TabsContent value="conversations" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh]">
                <Card className="lg:col-span-1 h-full">
                    <ConversationHistory 
                        conversations={conversations}
                        onSelectConversation={handleSelectConversation}
                        selectedConversationId={selectedConversation?.id}
                    />
                </Card>
                <div className="lg:col-span-2 h-full">
                    <ConversationViewer conversation={selectedConversation} />
                </div>
            </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-6">
            <IntegrationsPanel />
            <UsageGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
}