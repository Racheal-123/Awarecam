import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const getStatus = (expiresOn) => {
    if (!expiresOn) return { label: 'Valid', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> };
    const daysUntilExpiry = differenceInDays(new Date(expiresOn), new Date());
    if (daysUntilExpiry < 0) return { label: 'Expired', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-4 h-4" /> };
    if (daysUntilExpiry <= 30) return { label: 'Expires Soon', color: 'bg-amber-100 text-amber-800', icon: <Clock className="w-4 h-4" /> };
    return { label: 'Valid', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> };
};

export default function CertificationsTab({ certifications, employees }) {
    if (!certifications || certifications.length === 0) {
        return <div className="p-4 text-center text-slate-500">No certifications have been defined yet.</div>;
    }

    const employeesByCert = (certId) => {
        return employees.filter(emp => emp.certifications?.some(c => c.certification_id === certId));
    };

    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <CardTitle>Certifications & Training</CardTitle>
                <CardDescription>Track required certifications and employee statuses across the organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {certifications.map(cert => (
                    <div key={cert.id}>
                        <h3 className="text-lg font-semibold mb-2">{cert.name}</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 text-left font-medium text-slate-500">Employee</th>
                                        <th className="p-3 text-left font-medium text-slate-500">Expires On</th>
                                        <th className="p-3 text-left font-medium text-slate-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employeesByCert(cert.id).map(emp => {
                                        const empCert = emp.certifications.find(c => c.certification_id === cert.id);
                                        const status = getStatus(empCert.expires_on);
                                        return (
                                            <tr key={emp.id} className="border-t">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar size="sm"><AvatarImage src={emp.photo_url} /><AvatarFallback>{emp.name.charAt(0)}</AvatarFallback></Avatar>
                                                        {emp.name}
                                                    </div>
                                                </td>
                                                <td className="p-3">{empCert.expires_on ? format(new Date(empCert.expires_on), 'MMM d, yyyy') : 'N/A'}</td>
                                                <td className="p-3">
                                                    <Badge className={status.color}>
                                                        {status.icon}
                                                        <span className="ml-1">{status.label}</span>
                                                    </Badge>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                     {employeesByCert(cert.id).length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-4 text-center text-slate-400">No employees have this certification.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}