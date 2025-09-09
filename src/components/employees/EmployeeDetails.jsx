
import React from 'react';
import { motion } from 'framer-motion'; // Removed as Drawer handles animation
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescription removed as not used in new structure
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Mail, Phone, Briefcase, DollarSign, Calendar, HardHat, Shield, Edit, UserCheck } from 'lucide-react'; // Some icons might not be used now, but keeping for safety.
import { format } from 'date-fns';

// New imports for Tabs and Drawer
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription, // Not used, but part of common Drawer imports
  DrawerFooter,
  DrawerHeader,
  DrawerTitle, // Not used, but part of common Drawer imports
} from '@/components/ui/drawer';
import AssignedWorkTab from '@/components/employees/AssignedWorkTab';

export default function EmployeeDetails({ employee, roles, locations, onClose, onEdit }) {
  // Derive role and location objects from the passed arrays
  const role = roles?.find(r => r.id === employee.role_id);
  const location = locations?.find(l => l.id === employee.location_id);

  const riskColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-green-100 text-green-800'
  };
  
  return (
    <Drawer open={true} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]"> {/* Added max-h for better UX on smaller screens */}
        <DrawerHeader>
          <div className="relative text-center">
            {/* The X button is now handled by DrawerClose or footer buttons */}
            <div className="absolute top-0 right-0">
              <DrawerClose asChild>
                <Button variant="ghost" size="icon"><X className="w-5 h-5" /></Button>
              </DrawerClose>
            </div>
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
                <AvatarImage src={employee.photo_url} alt={employee.name} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-3xl">
                    {employee.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <DrawerTitle className="text-2xl font-bold">{employee.name}</DrawerTitle>
            <DrawerDescription>{role?.role_display_name || 'N/A'}</DrawerDescription> {/* Using DrawerDescription for role */}
            <div className="flex justify-center gap-2 mt-2">
                <Badge className={employee.status === 'active' ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>
                    {employee.status ? employee.status.charAt(0).toUpperCase() + employee.status.slice(1) : 'N/A'}
                </Badge>
                 {role?.safety_risk_level && (
                    <Badge className={riskColors[role.safety_risk_level]}>
                        {role.safety_risk_level} Risk
                    </Badge>
                )}
            </div>
          </div>
        </DrawerHeader>
        <div className="p-6 overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assigned_work">Assigned Work</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
                <div className="space-y-6">
                    {/* Contact Info */}
                    <Card>
                        <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><strong>Email:</strong> {employee.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> {employee.phone || 'N/A'}</p>
                        </CardContent>
                    </Card>

                    {/* Role & Location */}
                    <Card>
                        <CardHeader><CardTitle>Role & Location</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><strong>Role:</strong> {role?.role_display_name || 'N/A'}</p>
                            <p><strong>Location:</strong> {location?.name || 'N/A'}</p>
                            <p><strong>Department:</strong> {employee.department || 'N/A'}</p>
                            <p><strong>Status:</strong> <span className="capitalize">{employee.status || 'N/A'}</span></p>
                            <p><strong>Hourly Rate:</strong> {employee.hourly_rate ? `$${employee.hourly_rate.toFixed(2)}` : 'N/A'}</p>
                            <p><strong>Start Date:</strong> {employee.start_date ? format(new Date(employee.start_date), 'MMMM d, yyyy') : 'N/A'}</p>
                        </CardContent>
                    </Card>

                    {/* Certifications (Re-added to preserve functionality) */}
                    {role?.required_certifications?.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>Certifications</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {role.required_certifications.map(cert => (
                                        <Badge key={cert} variant="secondary">{cert}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Activity (Placeholder) */}
                    <Card>
                        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500">Activity feed coming soon.</p>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            <TabsContent value="assigned_work" className="mt-4">
                <AssignedWorkTab employee={employee} />
            </TabsContent>
          </Tabs>
        </div>
        <DrawerFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 p-6 border-t">
          <DrawerClose asChild>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DrawerClose>
          <Button onClick={() => onEdit(employee)}><Edit className="w-4 h-4 mr-2"/> Edit Employee</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// InfoRow component removed as it is no longer used in the new structure.
