import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Search,
  X,
  List,
  LayoutGrid,
  Calendar as CalendarIcon,
  Radio,
  Bot
} from 'lucide-react';
import { format } from 'date-fns';

export default function EventFilters({ filters, onFilterChange, isLive, onLiveToggle, viewMode, onViewModeChange, agents }) {
  
  const handleValueChange = (key, value) => {
    onFilterChange(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (range) => {
    onFilterChange(prev => ({ ...prev, dateRange: range || { from: null, to: null } }));
  };

  const clearFilters = () => {
    onFilterChange({
      searchTerm: '',
      severity: 'all',
      status: 'all',
      agent: 'all',
      dateRange: { from: null, to: null }
    });
  };

  const activeFilterCount =
    (filters.searchTerm ? 1 : 0) +
    (filters.severity !== 'all' ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.agent !== 'all' ? 1 : 0) +
    (filters.dateRange.from ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Top row: Search and main actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search events by keyword, camera, zone..."
            className="pl-10"
            value={filters.searchTerm}
            onChange={(e) => handleValueChange('searchTerm', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch id="live-updates" checked={isLive} onCheckedChange={onLiveToggle} />
            <Label htmlFor="live-updates" className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${isLive ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
              Live Updates
            </Label>
          </div>
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-white">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3"
              onClick={() => onViewModeChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3"
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bottom row: Dropdown filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filters.severity} onValueChange={(v) => handleValueChange('severity', v)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filters.status} onValueChange={(v) => handleValueChange('status', v)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.agent} onValueChange={(v) => handleValueChange('agent', v)}>
          <SelectTrigger className="w-full sm:w-[180px]">
             <SelectValue placeholder="AI Agent" />
          </SelectTrigger>
          <SelectContent>
            {agents.map(agent => (
              <SelectItem key={agent} value={agent.toLowerCase() === 'all agents' ? 'all' : agent}>
                {agent}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start text-left font-normal sm:w-[260px]"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd, y")} - {format(filters.dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={filters.dateRange}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  );
}