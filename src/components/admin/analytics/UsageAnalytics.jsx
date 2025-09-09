import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Event as EventEntity } from '@/api/entities';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { eachDayOfInterval, format, parseISO, startOfDay } from 'date-fns';
import _ from 'lodash';

export default function UsageAnalytics({ dateRange }) {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const events = await EventEntity.filter({
          created_date_gte: dateRange.from.toISOString(),
          created_date_lte: dateRange.to.toISOString(),
        });
        
        const groupedEvents = _.groupBy(events, (e) => format(startOfDay(parseISO(e.created_date)), 'yyyy-MM-dd'));

        const fullDateRange = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

        const chartData = fullDateRange.map(date => {
            const formattedDate = format(date, 'yyyy-MM-dd');
            return {
                date: format(date, 'MMM dd'),
                count: groupedEvents[formattedDate]?.length || 0,
            };
        });

        setEventData(chartData);
      } catch (error) {
        console.error("Failed to fetch event data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [dateRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Analytics</CardTitle>
        <CardDescription>Events processed over the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-72">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={eventData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Events Processed" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}