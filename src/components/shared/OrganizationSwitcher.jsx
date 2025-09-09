import React, { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Building, Monitor } from 'lucide-react';
import { Organization } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { useLocation } from 'react-router-dom';

// Cache organizations to prevent repeated API calls
let orgCache = null;

export default function OrganizationSwitcher({ initialOrgId }) {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use cache if available
      let orgs = orgCache;
      if (!orgs) {
        orgs = await Organization.list();
        orgCache = orgs; // Cache the result
      }
      
      setOrganizations(orgs);
      if (initialOrgId) {
        const currentOrg = orgs.find(o => o.id === initialOrgId);
        setSelectedOrg(currentOrg || null);
      } else {
        setSelectedOrg(null);
      }
    } catch (error) {
      if (error.message.includes('429') || (error.response && error.response.status === 429)) {
        setError("Rate limit reached. Please wait and try again.");
      } else {
        setError("Failed to load organizations");
      }
      console.error("Failed to fetch organizations", error);
      // Use empty array as fallback
      setOrganizations([]);
      setSelectedOrg(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [initialOrgId]);

  const handleSelect = (org) => {
    if (org) {
      // Navigate to organization dashboard with org_id parameter
      const newUrl = `${createPageUrl('Dashboard')}?org_id=${org.id}`;
      window.location.href = newUrl;
    } else {
      // Navigate back to platform admin dashboard
      const newUrl = createPageUrl('AdminDashboard');
      window.location.href = newUrl;
    }
  };

  if (loading) {
    return <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400">Loading...</Button>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between text-slate-300 hover:text-white hover:bg-slate-800">
          <div className="flex items-center gap-3 truncate">
            {selectedOrg ? (
              <>
                <Building className="w-4 h-4" />
                <span className="truncate">{selectedOrg.name}</span>
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4" />
                <span>Platform View</span>
              </>
            )}
          </div>
          <ChevronsUpDown className="w-4 h-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Switch View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handleSelect(null)} disabled={!selectedOrg}>
          <Monitor className="w-4 h-4 mr-2" />
          Platform View
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {error && (
          <div className="text-sm text-red-600 flex items-center justify-between gap-2 p-2 bg-red-50 rounded">
            <span>{error}</span>
            <button onClick={fetchOrganizations} className="px-2 py-1 border rounded bg-white">Retry</button>
          </div>
        )}
        {organizations.length > 0 ? (
          organizations.map(org => (
            <DropdownMenuItem 
              key={org.id} 
              onSelect={() => handleSelect(org)} 
              disabled={selectedOrg?.id === org.id}
            >
              <Building className="w-4 h-4 mr-2" />
              {org.name}
            </DropdownMenuItem>
          ))
        ) : !error ? (
          <DropdownMenuItem disabled>
            No organizations found
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}