
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarContent, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import {
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  Paperclip,
  X,
  Check,
  Pin,
  PinOff,
  Lock,
  Unlock
} from 'lucide-react';
import { formatDistanceToNowStrict, format } from 'date-fns';
import { EventNotesService } from '@/components/services/EventNotesService';
import { User } from '@/api/entities';
import { motion, AnimatePresence } from 'framer-motion';

export default function EventNotesSection({ event, organizationId, autoFocus = false }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef(null);
  const notesContainerRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
    loadCurrentUser();
  }, [event.id]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to load user information",
        variant: "destructive",
      });
    }
  };

  const loadNotes = async () => {
    try {
      setLoading(true);
      const eventNotes = await EventNotesService.listByEvent({
        event_id: event.id,
        organization_id: organizationId
      });
      
      setNotes(eventNotes || []);
    } catch (error) {
      console.error('Failed to load notes:', error);
      toast({
        title: "Error Loading Notes",
        description: "Could not load event notes. Please try again.",
        variant: "destructive",
      });
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const createdNote = await EventNotesService.create({
        event_id: event.id,
        content: newNote.trim(),
        organization_id: organizationId,
        location_id: event.location_id,
        user_id: currentUser?.id
      });

      setNotes(prev => [createdNote, ...prev]);
      setNewNote('');
      
      toast({
        title: "Note Added",
        description: "Your note has been saved successfully.",
      });

      // NOTE: Removed global event dispatch to prevent page-wide refetch and reduce API calls.
      // The local state update is sufficient for the current user's view.

      // Scroll to bottom to show new note
      setTimeout(() => {
        if (notesContainerRef.current) {
          notesContainerRef.current.scrollTop = 0; // New notes are at the top
        }
      }, 100);
    } catch (error) {
      console.error('Failed to add note:', error);
      toast({
        title: "Failed to Add Note",
        description: "Could not save your note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editingContent.trim()) return;

    try {
      const updatedNote = await EventNotesService.update({
        id: noteId,
        content: editingContent.trim(),
        organization_id: organizationId
      });

      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, ...updatedNote } : note
      ));
      
      setEditingNoteId(null);
      setEditingContent('');
      
      toast({
        title: "Note Updated",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error('Failed to update note:', error);
      toast({
        title: "Failed to Update Note",
        description: "Could not save your changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await EventNotesService.remove({
        id: noteId,
        organization_id: organizationId
      });

      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      toast({
        title: "Note Deleted",
        description: "The note has been removed.",
      });
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast({
        title: "Failed to Delete Note",
        description: "Could not delete the note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = async (noteId, currentPinned) => {
    try {
      const updatedNote = await EventNotesService.update({
        id: noteId,
        pinned: !currentPinned,
        organization_id: organizationId
      });

      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, ...updatedNote } : note
      ));
      
      toast({
        title: currentPinned ? "Note Unpinned" : "Note Pinned",
        description: currentPinned ? "Note removed from top of list." : "Note pinned to top of list.",
      });
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      toast({
        title: "Failed to Update Note",
        description: "Could not update pin status.",
        variant: "destructive",
      });
    }
  };

  const startEditingNote = (note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const canEditNote = async (note) => {
    if (!currentUser || !note) return false;
    return await EventNotesService.canUserEdit(note, currentUser);
  };

  const canDeleteNote = async (note) => {
    if (!currentUser || !note) return false;
    return await EventNotesService.canUserDelete(note, currentUser);
  };

  // Sort notes: pinned first, then by created date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  if (loading) {
    return (
      <div className="bg-white border-t border-slate-200 flex flex-col h-96">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Notes
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-500">Loading notes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-slate-200 flex flex-col h-96">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Notes ({notes.length})
        </h3>
        <p className="text-sm text-slate-500">Add notes to track investigation progress and findings</p>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1 p-4" ref={notesContainerRef}>
        <AnimatePresence>
          {sortedNotes.length > 0 ? (
            <div className="space-y-4">
              {sortedNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`bg-slate-50 rounded-lg p-3 border border-slate-200 ${note.pinned ? 'ring-1 ring-blue-200 bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {note.user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm text-slate-900">
                          {note.user?.full_name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNowStrict(new Date(note.created_date), { addSuffix: true })}
                        </span>
                        {note.pinned && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Pin className="w-3 h-3" />
                            Pinned
                          </Badge>
                        )}
                        {note.is_internal && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1 text-orange-600 border-orange-200">
                            <Lock className="w-3 h-3" />
                            Internal
                          </Badge>
                        )}
                      </div>

                      {editingNoteId === note.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="min-h-[60px] text-sm"
                            placeholder="Edit your note..."
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateNote(note.id)}
                              disabled={!editingContent.trim()}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {note.content}
                          </p>
                          
                          {/* Note Actions */}
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleTogglePin(note.id, note.pinned)}
                              className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
                            >
                              {note.pinned ? <PinOff className="w-3 h-3 mr-1" /> : <Pin className="w-3 h-3 mr-1" />}
                              {note.pinned ? 'Unpin' : 'Pin'}
                            </Button>
                            
                            {/* Edit button - only show if user can edit */}
                            {(currentUser && (currentUser.id === note.user_id || ['admin', 'organization_admin', 'manager'].includes(currentUser.role))) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditingNote(note)}
                                className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
                              >
                                <Edit2 className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            )}
                            
                            {/* Delete button - only show if user can delete */}
                            {(currentUser && (currentUser.id === note.user_id || ['admin', 'organization_admin', 'manager'].includes(currentUser.role))) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteNote(note.id)}
                                className="h-6 px-2 text-xs text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm">No notes yet</p>
              <p className="text-xs text-slate-400">Add the first note to start tracking this event</p>
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Add Note Form */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <form onSubmit={handleNoteSubmit} className="space-y-3">
          <Textarea
            ref={textareaRef}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note about this event... Use @username to mention team members"
            className="min-h-[80px] bg-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleNoteSubmit(e);
              }
            }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700"
                disabled
              >
                <Paperclip className="w-4 h-4 mr-1" />
                Attach
              </Button>
              <span className="text-xs text-slate-400">
                Ctrl+Enter to submit
              </span>
            </div>
            <Button
              type="submit"
              disabled={!newNote.trim() || isSubmitting}
              size="sm"
            >
              <Send className="w-4 h-4 mr-1" />
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
