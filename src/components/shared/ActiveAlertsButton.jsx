import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, X, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

export default function ActiveAlertsButton({ alerts = [], onAcknowledge, onAcknowledgeAll }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeAlerts = alerts.filter(alert => !alert.acknowledged);

  if (activeAlerts.length === 0) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <BellRing className="w-5 h-5 text-slate-400" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellRing className="w-5 h-5 text-red-500 animate-pulse" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
            {activeAlerts.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-red-500" />
                Active Alerts ({activeAlerts.length})
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); onAcknowledgeAll(); }}
                className="text-xs"
              >
                Acknowledge All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {activeAlerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm text-slate-800 truncate">
                      {alert.camera_name}
                    </h4>
                    <Badge variant="destructive" className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {format(new Date(alert.created_date), 'HH:mm')}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id); }}
                      className="h-7 w-7 text-slate-400 hover:text-green-600 hover:bg-green-100 rounded-full"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}