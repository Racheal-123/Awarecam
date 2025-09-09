import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';

export default function EmptyGridSlot({ index, onAdd, disabled }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.05 }}
      className="aspect-video"
    >
      <button
        onClick={onAdd}
        disabled={disabled}
        className="w-full h-full flex flex-col items-center justify-center bg-slate-200/50 hover:bg-slate-300/70 rounded-lg border-2 border-dashed border-slate-400 text-slate-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-200/50"
      >
        <PlusCircle className="w-10 h-10 mb-2" />
        <span className="font-semibold">Add Camera</span>
      </button>
    </motion.div>
  );
}