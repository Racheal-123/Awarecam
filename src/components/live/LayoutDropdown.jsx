import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LayoutGrid, ChevronDown, Trash2 } from 'lucide-react';

export default function LayoutDropdown({
  layouts,
  activeLayout,
  onSelect,
  onDelete,
}) {
  const { predefined, custom } = layouts;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <LayoutGrid className="w-4 h-4 mr-2" />
          <span>{activeLayout || 'Custom View'}</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>Predefined Layouts</DropdownMenuLabel>
        {predefined.map((layout) => (
          <DropdownMenuItem key={layout.id} onSelect={() => onSelect(layout.id)}>
            {layout.name}
          </DropdownMenuItem>
        ))}
        {custom.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Custom Layouts</DropdownMenuLabel>
            {custom.map((layout) => (
              <DropdownMenuItem
                key={layout.name}
                onSelect={(e) => {
                  if (e.target.closest('.delete-layout-btn')) return;
                  onSelect(layout.name);
                }}
                className="flex justify-between items-center"
              >
                <span>{layout.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-500 hover:text-red-500 delete-layout-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(layout.name);
                  }}
                  title={`Delete ${layout.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}