import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Users, Upload, UserPlus } from 'lucide-react';
import { Employee } from '@/api/entities';
import { EmployeeRole } from '@/api/entities';
import { EmployeeCertification } from '@/api/entities';
import { EmployeeShift } from '@/api/entities';
import { Task } from '@/api/entities';
import { useLocationContext } from '@/components/shared/LocationContext';

import EmployeeForm from '@/components/employees/EmployeeForm';
import EmployeeDetails from '@/components/employees/EmployeeDetails';
import BulkImportModal from '@/components/employees/BulkImportModal';
import RolesManagementTab from '@/components/employees/RolesManagementTab';
import ShiftsCalendarTab from '@/components/employees/ShiftsCalendarTab';
import CertificationsTab from '@/components/employees/CertificationsTab';
import PerformanceTab from '@/components/employees/PerformanceTab';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('active');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    
    const { getLocationFilter, locations } = useLocationContext();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const locationFilter = getLocationFilter();
            const [employeeData, roleData, certData, shiftData, taskData] = await Promise.all([
                Employee.filter(locationFilter),
                EmployeeRole.list(),
                EmployeeCertification.list(),
                EmployeeShift.filter(locationFilter),
                Task.filter(locationFilter)
            ]);
            setEmployees(employeeData);
            setRoles(roleData);
            setCertifications(certData);
            setShifts(shiftData);
            setTasks(taskData);
        } catch (error) {
            console.error("Failed to load employee data:", error);
        } finally {
            setLoading(false);
        }
    }, [getLocationFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleOpenDetails = (employee) => {
        setSelectedEmployee(employee);
        setIsDetailsOpen(true);
    };

    const handleOpenForm = (employee = null) => {
        setSelectedEmployee(employee);
        setIsFormOpen(true);
    };
    
    const handleCloseDrawers = () => {
        setIsFormOpen(false);
        setIsDetailsOpen(false);
        setSelectedEmployee(null);
    };

    const handleSuccess = () => {
        setIsFormOpen(false);
        setIsImportOpen(false);
        loadData();
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || emp.employee_role_id === roleFilter;
        const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3"><Users className="text-blue-600 w-8 h-8"/>Employee Management</h1>
                    <p className="text-slate-600 mt-2">Manage your team, roles, shifts, and performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setIsImportOpen(true)}><Upload className="w-4 h-4 mr-2"/> Import CSV</Button>
                    <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-5 h-5 mr-2"/> Add Employee
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="roster" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="roster">Roster</TabsTrigger>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="shifts">Shifts & Availability</TabsTrigger>
                    <TabsTrigger value="certifications">Certifications</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                <TabsContent value="roster">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div>
                                    <CardTitle>Employee Roster</CardTitle>
                                    <CardDescription>A complete list of all employees in the selected locations.</CardDescription>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                                        <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10"/>
                                    </div>
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.role_display_name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                     <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="on_leave">On Leave</SelectItem>
                                            <SelectItem value="terminated">Terminated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-4 text-left font-medium text-slate-600">Name</th>
                                            <th className="p-4 text-left font-medium text-slate-600">Role</th>
                                            <th className="p-4 text-left font-medium text-slate-600">Contact</th>
                                            <th className="p-4 text-left font-medium text-slate-600">Location</th>
                                            <th className="p-4 text-left font-medium text-slate-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmployees.map(emp => {
                                            const role = roles.find(r => r.id === emp.employee_role_id);
                                            const location = locations.find(l => l.id === emp.location_id);
                                            return (
                                            <tr key={emp.id} onClick={() => handleOpenDetails(emp)} className="border-b hover:bg-slate-50 cursor-pointer">
                                                <td className="p-4 flex items-center gap-3">
                                                    <Avatar><AvatarImage src={emp.photo_url} /><AvatarFallback>{emp.name.charAt(0)}</AvatarFallback></Avatar>
                                                    <span className="font-semibold">{emp.name}</span>
                                                </td>
                                                <td className="p-4">{role?.role_display_name || 'N/A'}</td>
                                                <td className="p-4">{emp.email}</td>
                                                <td className="p-4">{location?.name || 'N/A'}</td>
                                                <td className="p-4 capitalize">{emp.status}</td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="roles"><RolesManagementTab roles={roles} /></TabsContent>
                <TabsContent value="shifts"><ShiftsCalendarTab employees={employees} shifts={shifts} /></TabsContent>
                <TabsContent value="certifications"><CertificationsTab certifications={certifications} employees={employees} /></TabsContent>
                <TabsContent value="performance"><PerformanceTab employees={employees} tasks={tasks} /></TabsContent>
            </Tabs>
            
            {isFormOpen && (
                 <EmployeeForm 
                    employee={selectedEmployee} 
                    roles={roles} 
                    locations={locations}
                    onClose={handleCloseDrawers}
                    onSuccess={handleSuccess}
                />
            )}
            
            {isDetailsOpen && (
                 <EmployeeDetails 
                    employee={selectedEmployee} 
                    roles={roles} 
                    locations={locations}
                    onClose={handleCloseDrawers}
                    onEdit={() => {
                        setIsDetailsOpen(false);
                        handleOpenForm(selectedEmployee);
                    }}
                />
            )}

            {isImportOpen && <BulkImportModal roles={roles} onClose={() => setIsImportOpen(false)} onSuccess={handleSuccess} />}
        </div>
    );
}