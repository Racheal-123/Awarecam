import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, User as UserIcon, MessageSquare, Flag, Star, ExternalLink, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const MessageContent = ({ content }) => {
  const parts = content.split(/(\[View Details\]\(.*?\))/g);
  return (
    <p className="text-sm whitespace-pre-wrap">
      {parts.map((part, index) => {
        const match = part.match(/\[View Details\]\((.*?)\)/);
        if (match) {
          const url = match[1];
          return (
            <Link key={index} to={url} className="inline-block mt-2">
              <Button variant="outline" size="sm" className="bg-white hover:bg-slate-100 border-blue-300 text-blue-700">
                View Details
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </Link>
          );
        }
        return part;
      })}
    </p>
  );
};

export default function ConversationViewer({ conversation }) {
  if (!conversation) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-slate-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select a conversation</h3>
          <p className="text-sm">Choose a conversation from the list to view its details here.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{conversation.summary_topic}</CardTitle>
                <CardDescription>
                  Conversation with {conversation.user_name} from {conversation.organization_name}
                </CardDescription>
                <p className="text-xs text-slate-500 mt-1">
                  Context: {conversation.conversation_context} &bull; {format(new Date(conversation.created_date), 'MMM d, yyyy, h:mm a')}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm"><Flag className="w-4 h-4 mr-2" /> Flag</Button>
                <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
            </div>
        </div>
        {conversation.user_feedback_rating && (
            <div className="flex items-center gap-2 pt-2">
                <Badge>Feedback</Badge>
                <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < conversation.user_feedback_rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                    ))}
                </div>
            </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
        {conversation.messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
              <MessageContent content={msg.content} />
              <p className="text-xs opacity-70 mt-1">
                {format(new Date(msg.timestamp), 'h:mm a')}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <UserIcon className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}