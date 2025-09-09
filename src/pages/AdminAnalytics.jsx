
import React, { useState } from 'react';
import { addDays, format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Download, Calendar as CalendarIcon } from 'lucide-react';

import SummaryCards from '@/components/admin/analytics/SummaryCards';
import UsageAnalytics from '@/components/admin/analytics/UsageAnalytics';
import GrowthRevenue from '@/components/admin/analytics/GrowthRevenue';
import TenantComparison from '@/components/admin/analytics/TenantComparison';
import SystemHealth from '@/components/admin/analytics/SystemHealth';
import RecentActivityFeed from '@/components/admin/analytics/RecentActivityFeed';
import ActiveAnomalies from '@/components/admin/analytics/ActiveAnomalies';
import AnomalyDetector from '@/components/admin/analytics/AnomalyDetector';

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  return (
    <div className="p-6 space-y-8">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Platform Analytics</h1>
          <p className="text-slate-600 mt-1">A global overview of platform metrics, health, and tenant usage.</p>
        </div>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className="w-[300px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Anomaly Detection Section */}
      <ActiveAnomalies />

      {/* Summary Cards */}
      <SummaryCards dateRange={dateRange} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <UsageAnalytics dateRange={dateRange} />
          <GrowthRevenue dateRange={dateRange} />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <SystemHealth />
          <RecentActivityFeed />
        </div>
      </div>
      
      {/* Cross-Tenant Comparison Table */}
      <TenantComparison dateRange={dateRange} />

      {/* Headless detector component */}
      <AnomalyDetector />
    </div>
  );
}
