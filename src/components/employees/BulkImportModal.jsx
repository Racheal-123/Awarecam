import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Download, CheckCircle2, AlertCircle, Loader2, FileText, ChevronRight, UserPlus } from 'lucide-react';
import { Employee } from '@/api/entities';

const CSV_TEMPLATE = `name,email,phone,role_display_name,department
John Smith,john.smith@example.com,555-123-4567,Forklift Operator,Warehouse A
Jane Doe,jane.doe@example.com,555-987-6543,Shift Supervisor,Operations`;

export default function BulkImportModal({ onClose, onSuccess, roles }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Complete
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      handleFile(selectedFile);
    } else {
      alert('Please select a valid CSV file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      handleFile(droppedFile);
    } else {
      alert('Please drop a valid CSV file.');
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  
  const handleFile = (uploadedFile) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const { data, validationErrors } = parseAndValidate(text);
      setParsedData(data);
      setErrors(validationErrors);
      setIsProcessing(false);
      if (validationErrors.length === 0 && data.length > 0) {
        setStep(2);
      }
    };
    reader.readAsText(uploadedFile);
  };

  const parseAndValidate = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    const validationErrors = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
      
      // Validation
      if (!row.name) validationErrors.push(`Row ${i+1}: Missing required field "name".`);
      
      const role = roles.find(r => r.role_display_name.toLowerCase() === row.role_display_name?.toLowerCase());
      if (!role) {
         validationErrors.push(`Row ${i+1}: Role "${row.role_display_name}" not found. Please use an existing role.`);
      } else {
        row.employee_role_id = role.id;
      }

      data.push(row);
    }
    return { data, validationErrors };
  };

  const handleFinalImport = async () => {
    setIsProcessing(true);
    const employeesToCreate = parsedData.map(row => ({
        name: row.name,
        email: row.email,
        phone: row.phone,
        employee_role_id: row.employee_role_id,
        department: row.department,
        status: 'active',
        // Assuming location_id and organization_id will be handled by backend or default logic
    }));
    
    try {
        await Employee.bulkCreate(employeesToCreate);
        setIsProcessing(false);
        setStep(3);
    } catch (error) {
        console.error("Bulk import failed:", error);
        setErrors(["An unexpected error occurred during the import process. Please try again."]);
        setIsProcessing(false);
    }
  };
  
  const renderStepOne = () => (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Download CSV Template</h4>
            <p className="text-sm text-blue-800">Use our template to ensure correct formatting.</p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" /> Template
          </Button>
        </div>
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        {isProcessing ? (
           <div className="flex items-center justify-center">
             <Loader2 className="w-5 h-5 mr-2 animate-spin"/>
             Processing...
           </div>
        ) : file ? (
            <div className="font-medium text-green-600 flex items-center justify-center">
              <FileText className="w-4 h-4 mr-2"/>
              {file.name}
            </div>
        ) : (
          <>
            <p className="font-medium mb-2">Drag & drop a CSV file here, or click to select</p>
            <p className="text-sm text-slate-500">Accepts .csv files only</p>
          </>
        )}
      </div>
      
       {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-red-900">Validation Errors</h4>
              </div>
              <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  {errors.map((error, index) => <li key={index}>{error}</li>)}
              </ul>
          </div>
      )}
    </>
  );
  
  const renderStepTwo = () => (
    <>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
              <h4 className="font-semibold text-green-900">Validation Successful!</h4>
              <p className="text-sm text-green-800">Review the {parsedData.length} records below before importing.</p>
          </div>
      </div>
      <div className="max-h-64 overflow-y-auto border rounded-lg">
          <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  {Object.keys(parsedData[0] || {}).filter(k => k !== 'employee_role_id').map(h => 
                    <th key={h} className="p-2 text-left font-medium">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                  {parsedData.map((row, i) => (
                      <tr key={i} className="border-t">
                          {Object.keys(row).filter(k => k !== 'employee_role_id').map(h => 
                            <td key={h} className="p-2 truncate">{row[h]}</td>
                          )}
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
      <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
          <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
          <Button onClick={handleFinalImport} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">
              {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Import {parsedData.length} Employees
          </Button>
      </div>
    </>
  );

  const renderStepThree = () => (
     <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-900 mb-2">Import Successful!</h3>
        <p className="text-slate-600 mb-6">{parsedData.length} new team members have been added.</p>
        <Button onClick={onSuccess}>Close</Button>
     </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl">
        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold">Bulk Import Team Members</CardTitle>
                    <CardDescription>Quickly add your entire team from a CSV file.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
            </div>
          </CardHeader>
          <CardContent className="min-h-[20rem]">
            {step === 1 && renderStepOne()}
            {step === 2 && renderStepTwo()}
            {step === 3 && renderStepThree()}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}