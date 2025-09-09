import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Organization } from '@/api/entities';
import { Camera } from '@/api/entities';
import { User } from '@/api/entities';
import { Event } from '@/api/entities';
import { Loader2 } from 'lucide-react';
import _ from 'lodash';

export default function TenantComparison({ dateRange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orgs, cameras, users, events] = await Promise.all([
          Organization.list(),
          Camera.list(),
          User.list(),
          Event.filter({
            created_date_gte: dateRange.from.toISOString(),
            created_date_lte: dateRange.to.toISOString(),
          }),
        ]);

        const eventsByOrg = _.groupBy(events, 'organization_id');
        const camerasByOrg = _.groupBy(cameras, 'organization_id');
        const usersByOrg = _.groupBy(users, 'organization_id');

        const comparisonData = orgs.map(org => ({
          id: org.id,
          name: org.name,
          industry: org.industry_type,
          plan: org.subscription_plan,
          userCount: usersByOrg[org.id]?.length || 0,
          cameraCount: camerasByOrg[org.id]?.length || 0,
          eventCount: eventsByOrg[org.id]?.length || 0,
        }));

        setData(_.orderBy(comparisonData, ['eventCount'], ['desc']));
      } catch (error) {
        console.error("Failed to fetch tenant comparison data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cross-Tenant Comparison</CardTitle>
        <CardDescription>Key metrics for each organization in the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-72">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Cameras</TableHead>
                <TableHead className="text-right">Events</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(org => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell className="capitalize">{org.industry}</TableCell>
                  <TableCell className="capitalize">{org.plan}</TableCell>
                  <TableCell className="text-right">{org.userCount}</TableCell>
                  <TableCell className="text-right">{org.cameraCount}</TableCell>
                  <TableCell className="text-right">{org.eventCount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}