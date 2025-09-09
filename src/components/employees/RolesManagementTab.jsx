import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HardHat, Shield, Wrench, Sparkles, Edit } from 'lucide-react';

const roleIcons = {
  safety: <Shield className="w-4 h-4" />,
  maintenance: <Wrench className="w-4 h-4" />,
  operations: <HardHat className="w-4 h-4" />,
  custom: <Sparkles className="w-4 h-4" />,
  default: <HardHat className="w-4 h-4" />,
};

export default function RolesManagementTab({ roles }) {
  if (!roles || roles.length === 0) {
    return <div className="p-4 text-center text-slate-500">No employee roles have been defined yet.</div>;
  }

  return (
    <Card className="border-0 shadow-none">
        <CardHeader>
            <CardTitle>Employee Roles</CardTitle>
            <CardDescription>Standardized roles that determine permissions, workflows, and assignments.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                    <Card key={role.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                {roleIcons[role.role_name] || roleIcons.default}
                                {role.role_display_name}
                            </CardTitle>
                             <CardDescription className="line-clamp-2">{role.role_description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                           <div>
                                <h4 className="text-xs font-semibold text-slate-500 mb-2">INDUSTRY CONTEXT</h4>
                                <div className="flex flex-wrap gap-1">
                                    {role.industry_context?.length > 0 ? (
                                        role.industry_context.map(ind => <Badge key={ind} variant="secondary" className="capitalize">{ind}</Badge>)
                                    ) : (
                                        <Badge variant="outline">General</Badge>
                                    )}
                                </div>
                           </div>
                           <div>
                                <h4 className="text-xs font-semibold text-slate-500 mb-2">DEFAULT WORKFLOWS</h4>
                                <p className="text-sm text-slate-700">{role.default_workflows?.length || 0} assigned</p>
                           </div>
                           <div>
                                <h4 className="text-xs font-semibold text-slate-500 mb-2">REQUIRED CERTIFICATIONS</h4>
                                 <p className="text-sm text-slate-700">{role.required_certifications?.length || 0} required</p>
                           </div>
                        </CardContent>
                        <div className="p-4 pt-0">
                            <Button variant="outline" size="sm" className="w-full">
                                <Edit className="w-4 h-4 mr-2" /> Manage Role
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </CardContent>
    </Card>
  );
}