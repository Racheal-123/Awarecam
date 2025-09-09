import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

export default function BulkActionBar({ count, onAcknowledge, onClear }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto bg-slate-900 text-white rounded-xl shadow-2xl p-3 flex items-center gap-4 z-50"
    >
      <div className="flex items-center gap-2">
        <div className="bg-blue-500 h-8 w-8 flex items-center justify-center rounded-lg font-bold text-sm">
          {count}
        </div>
        <span className="font-medium text-slate-200">
          {count} event{count > 1 ? 's' : ''} selected
        </span>
      </div>
      <div className="h-8 w-px bg-slate-700"></div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onAcknowledge} className="bg-blue-600 hover:bg-blue-700">
          <Check className="w-4 h-4 mr-2" />
          Acknowledge
        </Button>
        <Button variant="ghost" size="icon" onClick={onClear} className="text-slate-400 hover:bg-slate-700 hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
}