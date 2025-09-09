import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Organization } from '@/api/entities';
import { Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { eachDayOfInterval, format, parseISO, startOfDay } from 'date-fns';
import _ from 'lodash';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

export default function GrowthRevenue({ dateRange }) {
  const [signupData, setSignupData] = useState([]);
  const [revenueData, setRevenueData] = useState({ mrr: 0, byTier: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const orgs = await Organization.list();
        
        // Process signups
        const filteredOrgs = orgs.filter(o => {
            const createdDate = parseISO(o.created_date);
            return createdDate >= dateRange.from && createdDate <= dateRange.to;
        });

        const groupedSignups = _.groupBy(filteredOrgs, (o) => format(startOfDay(parseISO(o.created_date)), 'yyyy-MM-dd'));
        const fullDateRange = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
        const chartData = fullDateRange.map(date => ({
            date: format(date, 'MMM dd'),
            count: groupedSignups[format(date, 'yyyy-MM-dd')]?.length || 0,
        }));
        setSignupData(chartData);

        // Process revenue (mocked for now, as price is not on plan)
        const activeOrgs = orgs.filter(o => o.subscription_status === 'active' || o.subscription_status === 'trialing');
        const mrr = activeOrgs.reduce((acc, org) => {
            // Simplified MRR calculation
            if (org.subscription_plan === 'professional') return acc + 299;
            if (org.subscription_plan === 'enterprise') return acc + 999;
            return acc + 49; // basic/trial
        }, 0);
        
        const byTier = _.countBy(activeOrgs, 'subscription_plan');
        const pieData = Object.keys(byTier).map(key => ({ name: key, value: byTier[key] }));

        setRevenueData({ mrr, byTier: pieData });

      } catch (error) {
        console.error("Failed to fetch growth/revenue data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>New Signups</CardTitle>
          <CardDescription>New organizations created over time.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-60">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={signupData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Signups" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Tiers</CardTitle>
          <CardDescription>Total MRR: <span className="font-bold text-green-600">${revenueData.mrr.toLocaleString()}</span> (mocked)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-60">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={revenueData.byTier} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {revenueData.byTier.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}