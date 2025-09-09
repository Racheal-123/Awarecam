import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Library, Search, Filter, Loader2 } from 'lucide-react';
import { MediaLibraryItem } from '@/api/entities';
import { Organization } from '@/api/entities'; // Import Organization entity
import LibraryItemCard from '@/components/admin/library/LibraryItemCard';
import EditMediaItemModal from '@/components/admin/library/EditMediaItemModal';
import MediaViewerModal from '@/components/admin/library/MediaViewerModal';

export default function AdminLibraryPage() {
  const [mediaItems, setMediaItems] = useState([]);
  const [organizations, setOrganizations] = useState([]); // State for organizations
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const orgNameMap = useMemo(() => {
    return organizations.reduce((map, org) => {
      map[org.id] = org.name;
      return map;
    }, {});
  }, [organizations]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = mediaItems;
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(lowerSearchTerm) ||
        (item.description && item.description.toLowerCase().includes(lowerSearchTerm)) ||
        (item.labels && item.labels.some(label => label.toLowerCase().includes(lowerSearchTerm))) ||
        (orgNameMap[item.organization_id] && orgNameMap[item.organization_id].toLowerCase().includes(lowerSearchTerm))
      );
    }
    setFilteredItems(filtered);
  }, [searchTerm, mediaItems, orgNameMap]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [items, orgs] = await Promise.all([
        MediaLibraryItem.list('-created_date'),
        Organization.list()
      ]);
      setMediaItems(items);
      setFilteredItems(items);
      setOrganizations(orgs);
    } catch (error) {
      console.error("Failed to load media library items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this media item? This action is permanent.')) {
      await MediaLibraryItem.delete(itemId);
      loadData();
    }
  };

  const handleSave = async (updatedItem) => {
    await MediaLibraryItem.update(updatedItem.id, updatedItem);
    setShowEditModal(false);
    setSelectedItem(null);
    loadData();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Library className="w-8 h-8 text-blue-600" />
            Platform Media Manager
          </h1>
          <p className="text-slate-600 mt-1">Manage all media items across all organizations.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by title, description, label, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredItems.map((item, index) => (
            <motion.div layout key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
              <LibraryItemCard
                item={item}
                organizationName={orgNameMap[item.organization_id] || 'N/A'}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {filteredItems.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-16">
                <Library className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700">No Media Items Found</h3>
                <p className="text-slate-500 mt-2">Saved clips from any organization will appear here.</p>
            </CardContent>
          </Card>
      )}

      {showEditModal && selectedItem && (
        <EditMediaItemModal
          item={selectedItem}
          onSave={handleSave}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showViewModal && selectedItem && (
        <MediaViewerModal
          item={selectedItem}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            handleEdit(selectedItem);
          }}
        />
      )}
    </div>
  );
}