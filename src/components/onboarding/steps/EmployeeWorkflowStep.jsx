import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Upload, 
  UserPlus, 
  ClipboardCheck, 
  Sparkles, 
  CheckCircle,
  Building,
  Mail,
  Phone
} from 'lucide-react';

const WORKFLOW_TEMPLATES = {
  warehouse: [
    { id: 'forklift_safety', name: 'Forklift Safety Checklist', description: 'Daily forklift inspection and safety compliance' },
    { id: 'loading_dock', name: 'Loading Dock Operations', description: 'Truck arrival, loading, and departure procedures' },
    { id: 'inventory_check', name: 'Inventory Spot Check', description: 'Random inventory verification tasks' }
  ],
  manufacturing: [
    { id: 'equipment_maintenance', name: 'Equipment Maintenance', description: 'Scheduled equipment inspections and maintenance' },
    { id: 'safety_walkthrough', name: 'Safety Walkthrough', description: 'Daily safety inspection checklist' },
    { id: 'quality_control', name: 'Quality Control Check', description: 'Product quality verification tasks' }
  ],
  retail: [
    { id: 'store_opening', name: 'Store Opening Checklist', description: 'Daily opening procedures and safety checks' },
    { id: 'inventory_count', name: 'Inventory Count', description: 'Regular stock counting and verification' },
    { id: 'cleaning_routine', name: 'Cleaning & Maintenance', description: 'Store cleaning and maintenance tasks' }
  ],
  healthcare: [
    { id: 'room_cleaning', name: 'Room Sanitization', description: 'Patient room cleaning and disinfection' },
    { id: 'equipment_check', name: 'Medical Equipment Check', description: 'Daily equipment functionality verification' },
    { id: 'compliance_audit', name: 'Compliance Audit', description: 'Regular compliance and safety audits' }
  ]
};

export default function EmployeeWorkflowStep({ data, allData, onComplete, onAiMessage }) {
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState(data.employees || []);
  const [selectedWorkflows, setSelectedWorkflows] = useState(data.selected_workflows || []);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: 'operator'
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const industryType = allData.business_profile?.industry_type;
  const availableWorkflows = WORKFLOW_TEMPLATES[industryType] || WORKFLOW_TEMPLATES.warehouse;

  const handleAddEmployee = () => {
    if (!newEmployee.name) return;

    const employee = {
      ...newEmployee,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };

    setEmployees(prev => [...prev, employee]);
    setNewEmployee({ name: '', email: '', phone: '', department: '', role: 'operator' });
    setShowAddForm(false);

    if (onAiMessage) {
      onAiMessage(`I added ${employee.name} to my team. What workflows would you recommend assigning to them?`);
    }
  };

  const handleWorkflowToggle = (workflowId) => {
    setSelectedWorkflows(prev => 
      prev.includes(workflowId)
        ? prev.filter(id => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  const handleContinue = () => {
    const workflowData = {
      employees,
      selected_workflows: selectedWorkflows,
      employees_added: employees.length,
      workflows_configured: selectedWorkflows.length,
      setup_completed: true
    };

    onComplete(workflowData);
  };

  const handleSkip = () => {
    onComplete({
      employees: [],
      selected_workflows: [],
      employees_added: 0,
      workflows_configured: 0,
      setup_completed: false,
      skipped: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900">Workflow Automation Setup</h4>
              <p className="text-sm text-purple-700 mt-1">
                Add your team members and assign workflows to start automating your operations. 
                You can always add more employees and workflows later from your dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Members ({employees.length})
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Workflows ({selectedWorkflows.length})
          </TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-900">Your Team</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>

          {/* Add Employee Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserPlus className="w-5 h-5" />
                  Add Team Member
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emp_name">Full Name *</Label>
                    <Input
                      id="emp_name"
                      placeholder="John Smith"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emp_department">Department</Label>
                    <Input
                      id="emp_department"
                      placeholder="Operations, Maintenance, etc."
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emp_email">Email</Label>
                    <Input
                      id="emp_email"
                      type="email"
                      placeholder="john@company.com"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emp_phone">Phone</Label>
                    <Input
                      id="emp_phone"
                      placeholder="(555) 123-4567"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEmployee} disabled={!newEmployee.name}>
                    Add Employee
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Employee List */}
          {employees.length > 0 ? (
            <div className="grid gap-3">
              {employees.map((employee) => (
                <Card key={employee.id} className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{employee.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          {employee.department && (
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {employee.department}
                            </div>
                          )}
                          {employee.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {employee.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-slate-300">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="font-medium text-slate-900 mb-2">No team members added yet</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Add your team members to assign workflows and track their performance
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Your First Employee
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div>
            <h3 className="font-medium text-slate-900 mb-2">
              Recommended Workflows for {industryType} Operations
            </h3>
            <p className="text-sm text-slate-600">
              Select workflows that match your operational needs. You can customize these later.
            </p>
          </div>

          <div className="grid gap-4">
            {availableWorkflows.map((workflow) => (
              <Card
                key={workflow.id}
                className={`cursor-pointer transition-all ${
                  selectedWorkflows.includes(workflow.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleWorkflowToggle(workflow.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedWorkflows.includes(workflow.id)
                        ? 'bg-blue-100'
                        : 'bg-slate-100'
                    }`}>
                      {selectedWorkflows.includes(workflow.id) ? (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ClipboardCheck className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{workflow.name}</h4>
                      <p className="text-sm text-slate-600">{workflow.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Continue/Skip Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={handleSkip}>
          Skip for Now
        </Button>
        
        <Button 
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 px-8"
        >
          Complete Workflow Setup
        </Button>
      </div>
    </div>
  );
}