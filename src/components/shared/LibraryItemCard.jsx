import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Video, Image, Eye, Edit, Trash2, Clock, Camera } from 'lucide-react';
import { format } from 'date-fns';

export default function LibraryItemCard({ item, onView, onEdit, onDelete }) {
  const isVideo = item.media_type === 'video';

  return (
    <Card className="overflow-hidden flex flex-col h-full shadow-lg border-0 hover:shadow-xl transition-shadow">
      <CardHeader className="p-0">
        <div 
          className="relative aspect-video bg-slate-800 cursor-pointer group"
          onClick={() => onView(item)}
        >
          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute top-2 left-2">
            <Badge className={isVideo ? 'bg-red-500/80' : 'bg-blue-500/80'}>
              {isVideo ? <Video className="w-3 h-3 mr-1" /> : <Image className="w-3 h-3 mr-1" />}
              {item.media_type}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-4 right-4">
             <CardTitle className="text-white text-lg truncate">{item.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <div className="flex flex-wrap gap-1 mb-3">
          {item.labels.slice(0, 3).map((label) => (
            <Badge key={label} variant="secondary">{label}</Badge>
          ))}
          {item.labels.length > 3 && <Badge variant="outline">+{item.labels.length - 3}</Badge>}
        </div>
        <p className="text-sm text-slate-600 line-clamp-2">{item.description || 'No description provided.'}</p>
        {item.original_camera_name && (
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
            <Camera className="w-3 h-3" />
            <span>{item.original_camera_name}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 bg-slate-50/50 border-t">
        <div className="w-full flex justify-between items-center text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3"/>
                <span>{format(new Date(item.created_date), 'MMM d, yyyy')}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(item)}>
                  <Eye className="w-4 h-4 mr-2" /> View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500" onClick={() => onDelete(item.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}