import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Video,
  Wifi,
  WifiOff,
  MapPin,
  Eye,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';

// Reusable function to get a representative image for a camera
function getCameraImage(camera) {
  if (!camera || !camera.name) {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop';
  }
  
  const name = String(camera.name || '').toLowerCase();
  const location = String(camera.location || '').toLowerCase();

  if (name.includes('entrance') || name.includes('entry') || location.includes('entrance')) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop';
  } else if (name.includes('checkout') || name.includes('register') || name.includes('counter') || location.includes('checkout')) {
    return 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop';
  } else if (name.includes('warehouse') || name.includes('loading') || name.includes('dock') || location.includes('warehouse') || location.includes('loading')) {
    return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop';
  } else if (name.includes('parking') || name.includes('lot') || name.includes('garage') || location.includes('parking')) {
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';
  } else {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop';
  }
}


export default function CameraCard({ camera, index, isSelected, onSelect, onView, onEdit, onDelete, showLocation }) {
  if (!camera) {
    return (
      <Card className="border-red-500 bg-red-50 p-4">
        <div className="flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          <div>
            <p className="font-bold text-red-700">Camera Data Error</p>
            <p className="text-sm text-red-600">This camera could not be loaded.</p>
          </div>
        </div>
      </Card>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: (index % 12) * 0.05 }
    }
  };

  const statusInfo = {
    active: { icon: Wifi, color: 'text-green-500', label: 'Active' },
    inactive: { icon: WifiOff, color: 'text-slate-400', label: 'Inactive' },
    maintenance: { icon: AlertTriangle, color: 'text-yellow-500', label: 'Maintenance' },
    error: { icon: AlertTriangle, color: 'text-red-500', label: 'Error' },
  };
  
  const currentStatus = statusInfo[camera.status] || statusInfo.inactive;
  const StatusIcon = currentStatus.icon;

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative">
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(camera.id, checked)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select camera ${camera.name}`}
            />
          </div>
          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onView(camera)}>
                  <Eye className="w-4 h-4 mr-2" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(camera)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit Camera
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(camera.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div 
            className="aspect-video bg-slate-800 cursor-pointer"
            onClick={() => onView(camera)}
          >
            <img 
              src={getCameraImage(camera)} 
              alt={camera.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop';
              }}
            />
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-slate-800 truncate">{camera.name}</h3>
          {showLocation && camera.location && (
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <MapPin className="w-3 h-3" />
              <p>{camera.location}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <Badge variant={camera.status === 'active' ? 'default' : 'outline'} className={`flex items-center gap-2 ${camera.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : ''}`}>
            <StatusIcon className={`w-3 h-3 ${currentStatus.color}`} />
            {currentStatus.label}
          </Badge>
          <div className="text-xs text-slate-500">
            {camera.events_today || 0} events today
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}