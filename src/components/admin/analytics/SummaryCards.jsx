import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Organization as OrgEntity } from '@/api/entities';
import { Camera as CameraEntity } from '@/api/entities';
import { User as UserEntity } from '@/api/entities';
import { Event as EventEntity } from '@/api/entities';
import {
  Building,
  Camera,
  Users,
  BarChart3,
  Loader2
} from 'lucide-react';
import { isWithinInterval } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, isLoading }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      <Icon className="h-5 w-5 text-slate-400" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

export default function SummaryCards({ dateRange }) {
  const [stats, setStats] = useState({
    orgs: { total: 0, active: 0 },
    cameras: { total: 0, active: 0 },
    users: { total: 0 },
    events: { total: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orgs, cameras, users, events] = await Promise.all([
          OrgEntity.list(),
          CameraEntity.list(),
          UserEntity.list(),
          EventEntity.filter({
            created_date_gte: dateRange.from.toISOString(),
            created_date_lte: dateRange.to.toISOString(),
          }),
        ]);

        setStats({
          orgs: {
            total: orgs.length,
            active: orgs.filter(o => o.subscription_status === 'active' || o.subscription_status === 'trialing').length,
          },
          cameras: {
            total: cameras.length,
            active: cameras.filter(c => c.status === 'active').length,
          },
          users: {
            total: users.length,
          },
          events: {
            total: events.length,
          },
        });
      } catch (error) {
        console.error("Failed to fetch summary stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Organizations"
        value={`${stats.orgs.active} / ${stats.orgs.total}`}
        icon={Building}
        isLoading={loading}
      />
      <StatCard
        title="Total Cameras"
        value={`${stats.cameras.active} / ${stats.cameras.total}`}
        icon={Camera}
        isLoading={loading}
      />
      <StatCard
        title="Total Users"
        value={stats.users.total}
        icon={Users}
        isLoading={loading}
      />
      <StatCard
        title={`Events (${Math.round((dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24))}d)`}
        value={stats.events.total.toLocaleString()}
        icon={BarChart3}
        isLoading={loading}
      />
    </div>
  );
}