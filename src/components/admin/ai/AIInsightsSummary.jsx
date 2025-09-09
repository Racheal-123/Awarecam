import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MessageSquare, Users, Star, TrendingUp } from 'lucide-react';

const commonQueriesData = [
  { name: 'Event Search', count: 45 },
  { name: 'Task Count', count: 32 },
  { name: 'Camera Status', count: 21 },
  { name: 'Overdue Tasks', count: 18 },
  { name: 'User Guide', count: 12 },
];

export default function AIInsightsSummary({ conversations }) {
  const totalConversations = conversations.length;
  const totalMessages = conversations.reduce((acc, curr) => acc + (curr.messages?.length || 0), 0);
  const avgMessagesPerConvo = totalConversations > 0 ? (totalMessages / totalConversations).toFixed(1) : 0;
  
  const ratedConversations = conversations.filter(c => c.user_feedback_rating);
  const avgRating = ratedConversations.length > 0 
    ? (ratedConversations.reduce((acc, curr) => acc + curr.user_feedback_rating, 0) / ratedConversations.length).toFixed(2)
    : 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalConversations}</div>
          <p className="text-xs text-muted-foreground">+5% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Messages / Convo</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgMessagesPerConvo}</div>
          <p className="text-xs text-muted-foreground">Across all conversations</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Feedback</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgRating} / 5</div>
          <p className="text-xs text-muted-foreground">{ratedConversations.length} ratings submitted</p>
        </CardContent>
      </Card>
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Users interacting in last 7 days</p>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Most Common Queries</CardTitle>
          <CardDescription>Top topics users are asking about.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={commonQueriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}/>
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}