import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BellRing, Clock, Shield, CheckCircle, XCircle, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function AlertPopup({ alert, camera, onClose, onAcknowledge }) {
  if (!alert) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-sm shadow-2xl border-red-500 border-2">
        <CardHeader className="bg-red-50 text-red-800 p-4 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-lg">
            <BellRing className="w-6 h-6 animate-shake" />
            Active Alert
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-800">{camera.name}</h3>
            <p className="text-sm text-slate-500">{camera.location}</p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <p className="text-sm font-medium">{alert.event_type.replace(/_/g, ' ')}</p>
              <Badge variant="destructive" className="ml-auto capitalize">{alert.severity}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <p className="text-sm">{format(new Date(alert.created_date), 'PPpp')}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Triggered Actions</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Send className="w-4 h-4 text-blue-500" /> Email to Safety Team</span>
                <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Send className="w-4 h-4 text-purple-500" /> Webhook to Slack</span>
                <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Send className="w-4 h-4 text-red-500" /> SMS to Supervisor</span>
                <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
            <Button onClick={() => onAcknowledge(camera.id)} className="w-full bg-red-600 hover:bg-red-700">
              Acknowledge
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}