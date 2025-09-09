import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Organization } from '@/api/entities';
import { User } from '@/api/entities';
import { Loader2, Building, UserPlus, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function RecentActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orgs, users] = await Promise.all([
          Organization.list('-created_date', 5),
          User.list('-created_date', 5),
        ]);

        const orgActivities = orgs.map(o => ({
          type: 'new_org',
          text: `${o.name} joined`,
          date: o.created_date,
          icon: Building,
        }));
        
        const userActivities = users.map(u => ({
          type: 'new_user',
          text: `${u.full_name} signed up`,
          date: u.created_date,
          icon: UserPlus,
        }));
        
        const combined = [...orgActivities, ...userActivities]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 7);
          
        setActivities(combined);
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest signups and platform events.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="p-2 bg-slate-100 rounded-full">
                  <activity.icon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.text}</p>
                  <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(activity.date), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}