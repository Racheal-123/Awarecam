import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function ChecklistStepView({ step, updateStepData }) {
    const [checkedItems, setCheckedItems] = useState([]);

    useEffect(() => {
        const initialChecked = step.evidence
            ?.filter(e => e.type === 'checklist_item')
            .map(e => e.value) || [];
        setCheckedItems(initialChecked);
    }, [step.evidence]);

    const handleCheckChange = (item, isChecked) => {
        const newCheckedItems = isChecked
            ? [...checkedItems, item]
            : checkedItems.filter(i => i !== item);
            
        setCheckedItems(newCheckedItems);
        
        const newEvidence = newCheckedItems.map(checkedItem => ({
            type: 'checklist_item',
            value: checkedItem,
            timestamp: new Date().toISOString()
        }));
        
        const allItemsChecked = step.checklist_options.length > 0 && step.checklist_options.every(option => newCheckedItems.includes(option));
        
        updateStepData({
            evidence: newEvidence,
            status: allItemsChecked ? 'completed' : 'pending'
        });
    };


    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="text-slate-600">{step.description}</p>
            <div className="space-y-3 pt-4">
                {step.checklist_options?.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg border shadow-sm">
                        <Checkbox
                            id={`checklist-${index}`}
                            checked={checkedItems.includes(item)}
                            onCheckedChange={(checked) => handleCheckChange(item, checked)}
                            className="mt-1"
                        />
                        <Label htmlFor={`checklist-${index}`} className="flex-1 text-base font-medium">
                            {item}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
}