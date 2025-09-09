import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const modalVariants = cva(
  "fixed left-1/2 top-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 border bg-white dark:bg-neutral-900 p-0 shadow-2xl ring-1 ring-black/5 duration-200 sm:rounded-2xl",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        '2xl': "max-w-2xl",
        '3xl': "max-w-3xl",
        full: "h-full w-full max-w-full rounded-none sm:rounded-2xl"
      }
    },
    defaultVariants: {
      size: "lg"
    }
  }
);

const Modal = ({ isOpen, onClose, children, size }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className={modalVariants({ size })}>
      <div className="flex flex-col h-full max-h-screen">
        {children}
      </div>
    </DialogContent>
  </Dialog>
);

const ModalHeader = ({ title, subtitle, icon: Icon, onClose }) => (
  <div className="flex items-start justify-between gap-3 p-5 border-b border-neutral-200 dark:border-neutral-800">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-10 h-10 flex-shrink-0 bg-slate-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-600 dark:text-neutral-300" />
        </div>
      )}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
      </div>
    </div>
    {onClose && (
      <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
        <X className="w-5 h-5 text-slate-500" />
      </Button>
    )}
  </div>
);

const ModalBody = ({ children, className }) => (
  <div className={`flex-1 p-5 overflow-y-auto max-h-[70vh] ${className || ''}`}>
    {children}
  </div>
);

const ModalFooter = ({ children, className }) => (
  <div className={`flex justify-end gap-3 p-4 border-t border-neutral-200 dark:border-neutral-800 ${className || ''}`}>
    {children}
  </div>
);

export { Modal, ModalHeader, ModalBody, ModalFooter };