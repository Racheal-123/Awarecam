import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format, isFuture, isPast, startOfToday } from 'date-fns';

import { WorkflowAssignment } from '@/api/entities';
import { WorkflowTemplate } from '@/api/entities';
import { generateOccurrences } from '@/components/workflows/schedule-utils';
import { useLocationContext } from '@/components/shared/LocationContext';

export default function AssignedWorkTab({ employee }) {
  const location = useLocationContext();
  const [assignments, setAssignments] = useState([]);
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const { getLocationFilter, isAllLocations } = location;

  useEffect(() => {
    async function loadData() {
      if (!employee) return;
      setLoading(true);
      try {
        const locationFilter = getLocationFilter();

        // Fetch assignments for this specific employee
        const directAssignments = await WorkflowAssignment.filter({
          ...locationFilter,
          assignee_id: employee.id,
          assignee_type: 'employee',
          status: 'active',
        });

        // Fetch assignments for this employee's roles
        const roleIds = [employee.employee_role_id, ...(employee.additional_role_ids || [])].filter(Boolean);
        let roleAssignments = [];
        if (roleIds.length > 0) {
            const rolePromises = roleIds.map(roleId => 
                WorkflowAssignment.filter({
                    ...locationFilter,
                    assignee_id: roleId,
                    assignee_type: 'role',
                    status: 'active',
                })
            );
            const results = await Promise.all(rolePromises);
            roleAssignments = results.flat();
        }
        
        const allAssignments = [...directAssignments, ...roleAssignments];
        const uniqueAssignments = Array.from(new Map(allAssignments.map(item => [item.id, item])).values());
        setAssignments(uniqueAssignments);
        
        // Fetch necessary templates
        const templateIds = [...new Set(uniqueAssignments.map(a => a.workflow_template_id))];
        if (templateIds.length > 0) {
            const tplData = await WorkflowTemplate.filter({ id: { $in: templateIds } });
            setTemplates(Object.fromEntries(tplData.map(t => [t.id, t])));
        }
      } catch (error) {
        console.error("Failed to load assigned work", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employee, getLocationFilter]);

  const upcomingOccurrences = useMemo(() => {
    const allOccurrences = assignments.flatMap(assignment => {
      // Generate occurrences for the next 30 days
      const dates = generateOccurrences(assignment, 30);
      return dates.map(date => ({
        date,
        assignment,
        template: templates[assignment.workflow_template_id],
      }));
    });

    // Filter for future occurrences and sort them
    return allOccurrences
      .filter(occ => occ.date && isFuture(occ.date))
      .sort((a, b) => a.date - b.date)
      .slice(0, 15); // Limit to next 15 for performance
  }, [assignments, templates]);
  
  if (loading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Scheduled Tasks</CardTitle>
        <CardDescription>A list of upcoming tasks generated from assigned workflows.</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingOccurrences.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming scheduled tasks.</p>
        ) : (
          <div className="space-y-4">
            {upcomingOccurrences.map((occ, index) => (
              <div key={`${occ.assignment.id}-${index}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold">{occ.template?.name || 'Scheduled Task'}</p>
                  <p className="text-sm text-slate-600">{format(occ.date, "E, MMM d 'at' p")}</p>
                </div>
                <Badge variant={occ.assignment.priority === 'high' || occ.assignment.priority === 'critical' ? 'destructive' : 'secondary'}>
                    {occ.assignment.priority}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}