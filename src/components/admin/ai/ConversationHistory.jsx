import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ConversationHistory({ conversations, onSelectConversation, selectedConversationId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredConversations = useMemo(() => {
    return conversations
      .filter(convo => {
        const searchLower = searchTerm.toLowerCase();
        return (
          convo.user_name?.toLowerCase().includes(searchLower) ||
          convo.organization_name?.toLowerCase().includes(searchLower) ||
          convo.summary_topic?.toLowerCase().includes(searchLower)
        );
      })
      .filter(convo => {
        if (filter === 'all') return true;
        if (filter === 'flagged') return convo.is_flagged;
        if (filter === 'feedback') return convo.user_feedback_rating > 0;
        return true;
      });
  }, [conversations, searchTerm, filter]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by user, org, or topic..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter conversations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conversations</SelectItem>
            <SelectItem value="flagged">Flagged for Review</SelectItem>
            <SelectItem value="feedback">With Feedback</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(convo => (
            <div
              key={convo.id}
              className={`flex items-start gap-4 p-4 cursor-pointer transition-colors border-b ${
                selectedConversationId === convo.id
                  ? 'bg-blue-50'
                  : 'hover:bg-slate-50'
              }`}
              onClick={() => onSelectConversation(convo)}
            >
              <Avatar>
                <AvatarFallback>{convo.user_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-sm text-slate-900">{convo.user_name}</p>
                  <p className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true })}
                  </p>
                </div>
                <p className="text-xs text-slate-600">{convo.organization_name}</p>
                <p className="text-sm text-slate-800 mt-1 truncate">{convo.summary_topic}</p>
                <div className="mt-2 flex gap-2">
                    {convo.is_flagged && <Badge variant="destructive">Flagged</Badge>}
                    {convo.user_feedback_rating && <Badge variant="secondary">Rated: {convo.user_feedback_rating} ★</Badge>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p>No conversations found.</p>
          </div>
        )}
      </div>
    </div>
  );
}