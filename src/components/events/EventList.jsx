import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Loader2 } from 'lucide-react';
import EventCard from '@/components/events/EventCard';

export default function EventList({ events, viewMode, selectedIds, onSelectionChange, onSelectAll, onViewDetails, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="border-dashed border-2 shadow-none">
        <CardContent className="text-center py-16">
          <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No Events Found</h3>
          <p className="text-slate-500 mt-2">
            Try adjusting your search criteria or check back later for new events.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isAllSelected = selectedIds.size > 0 && selectedIds.size === events.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < events.length;

  return (
    <div>
      {viewMode === 'list' && (
        <Card>
          <CardHeader className="p-4 border-b">
             <div className="flex items-center font-medium text-slate-600 text-sm px-4">
                <Checkbox
                    id="select-all"
                    className="mr-4"
                    checked={isAllSelected}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all"
                />
                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">Event Details</div>
                    <div className="col-span-2">Camera</div>
                    <div className="col-span-2">AI Bot</div>
                    <div className="col-span-2">Severity</div>
                    <div className="col-span-2">Status</div>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="space-y-1">
                <AnimatePresence>
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <EventCard
                        event={event}
                        viewMode="list"
                        isSelected={selectedIds.has(event.id)}
                        onSelectionChange={onSelectionChange}
                        onViewDetails={(event, section) => onViewDetails(event, section)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <EventCard
                  event={event}
                  viewMode="grid"
                  onViewDetails={(event, section) => onViewDetails(event, section)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}