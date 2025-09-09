import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Library, Search, Filter, Loader2, Image, Video, Upload } from 'lucide-react';
import { MediaLibraryItem } from '@/api/entities';
import { User } from '@/api/entities';
import { Organization } from '@/api/entities';
import LibraryItemCard from '@/components/shared/LibraryItemCard';
import EditMediaItemModal from '@/components/shared/EditMediaItemModal';
import MediaViewerModal from '@/components/shared/MediaViewerModal';

export default function MediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = mediaItems;
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(lowerSearchTerm) ||
        item.description.toLowerCase().includes(lowerSearchTerm) ||
        item.labels.some(label => label.toLowerCase().includes(lowerSearchTerm))
      );
    }
    setFilteredItems(filtered);
  }, [searchTerm, mediaItems]);

  const loadData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // Get organization context
      const params = new URLSearchParams(window.location.search);
      const orgId = params.get('org_id');
      
      let targetOrgId = orgId;
      if (!orgId && userData.organization_id) {
        targetOrgId = userData.organization_id;
      }

      if (targetOrgId) {
        const orgData = await Organization.get(targetOrgId);
        setOrganization(orgData);
        
        // Load media items for this organization
        const items = await MediaLibraryItem.filter({ organization_id: targetOrgId });
        setMediaItems(items);
        setFilteredItems(items);
      } else {
        // For platform admins viewing globally, show all items
        const items = await MediaLibraryItem.list('-created_date');
        setMediaItems(items);
        setFilteredItems(items);
      }
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
    if (window.confirm('Are you sure you want to delete this media item? This action cannot be undone.')) {
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

  const getStats = () => {
    const videos = filteredItems.filter(item => item.media_type === 'video').length;
    const screenshots = filteredItems.filter(item => item.media_type === 'screenshot').length;
    const thisWeek = filteredItems.filter(item => {
      const created = new Date(item.created_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    }).length;

    return { videos, screenshots, thisWeek };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Library className="w-8 h-8 text-blue-600" />
            Media Library
          </h1>
          <p className="text-slate-600 mt-1">
            View and manage your saved screenshots and video clips
            {organization && <span className="ml-2">• {organization.name}</span>}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">Total Items</p>
                <p className="text-3xl font-bold text-blue-900">{filteredItems.length}</p>
              </div>
              <Library className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-medium">Videos</p>
                <p className="text-3xl font-bold text-purple-900">{stats.videos}</p>
              </div>
              <Video className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Screenshots</p>
                <p className="text-3xl font-bold text-green-900">{stats.screenshots}</p>
              </div>
              <Image className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-700 text-sm font-medium">This Week</p>
                <p className="text-3xl font-bold text-amber-900">{stats.thisWeek}</p>
              </div>
              <Upload className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by title, description, or label..."
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
            <p className="text-slate-500 mt-2 mb-6">
              {mediaItems.length === 0 
                ? "Save clips and screenshots from the video player to build your media library." 
                : "Try adjusting your search criteria."}
            </p>
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