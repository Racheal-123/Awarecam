import { EventNote } from '@/api/entities';
import { User } from '@/api/entities';
import { toast } from 'sonner';

const validateRequired = (params, requiredFields) => {
  for (const field of requiredFields) {
    if (!params[field]) {
      throw new Error(`${field} is required`);
    }
  }
};

const getCurrentUserContext = async () => {
  try {
    const user = await User.me();
    if (!user.organization_id) {
      throw new Error('User must belong to an organization');
    }
    return { user, organization_id: user.organization_id };
  } catch (error) {
    console.error('Failed to get user context:', error);
    throw new Error('Authentication required');
  }
};

export const EventNoteService = {
  async create({ organization_id, event_id, camera_id, content, created_by }) {
    try {
      validateRequired({ event_id, content }, ['event_id', 'content']);
      
      // Get user context if not provided
      let finalOrgId = organization_id;
      let finalCreatedBy = created_by;
      
      if (!finalOrgId || !finalCreatedBy) {
        const context = await getCurrentUserContext();
        finalOrgId = finalOrgId || context.organization_id;
        finalCreatedBy = finalCreatedBy || context.user.id;
      }
      
      if (!content.trim()) {
        throw new Error('Note content cannot be empty');
      }

      const noteData = {
        organization_id: finalOrgId,
        event_id,
        user_id: finalCreatedBy,
        content: content.trim()
      };
      
      // Add camera_id if provided for additional context
      if (camera_id) {
        noteData.camera_id = camera_id;
      }

      const createdNote = await EventNote.create(noteData);
      
      // Enrich with user info
      try {
        const user = await User.get(createdNote.user_id);
        return { ...createdNote, user };
      } catch (userError) {
        console.warn('Failed to enrich note with user info:', userError);
        return createdNote;
      }
      
    } catch (error) {
      console.error('EventNoteService.create error:', error);
      
      if (error.message.includes('required') || error.message.includes('empty')) {
        toast.error(error.message);
      } else if (error.message.includes('Authentication')) {
        toast.error('Please log in to add notes');
      } else {
        toast.error("Couldn't save note. Please try again.");
      }
      
      throw error;
    }
  },

  async listByEvent({ organization_id, event_id }) {
    try {
      validateRequired({ event_id }, ['event_id']);
      
      // Get organization context if not provided
      let finalOrgId = organization_id;
      if (!finalOrgId) {
        const context = await getCurrentUserContext();
        finalOrgId = context.organization_id;
      }

      const notes = await EventNote.filter(
        { 
          organization_id: finalOrgId, 
          event_id 
        }, 
        '-created_date', 
        100
      );
      
      // Enrich notes with user information
      const enrichedNotes = await Promise.all(
        notes.map(async (note) => {
          try {
            const user = await User.get(note.user_id);
            return { ...note, user };
          } catch (userError) {
            console.warn(`Failed to load user ${note.user_id}:`, userError);
            return { 
              ...note, 
              user: { 
                full_name: 'Unknown User', 
                email: '', 
                id: note.user_id 
              } 
            };
          }
        })
      );
      
      return enrichedNotes;
      
    } catch (error) {
      console.error('EventNoteService.listByEvent error:', error);
      
      if (error.message.includes('required')) {
        toast.error(error.message);
      } else if (error.message.includes('Authentication')) {
        toast.error('Please log in to view notes');
      } else {
        toast.error("Couldn't load notes. Please refresh and try again.");
      }
      
      throw error;
    }
  },

  async update({ id, content, organization_id }) {
    try {
      validateRequired({ id }, ['id']);
      
      // Get organization context if not provided
      let finalOrgId = organization_id;
      if (!finalOrgId) {
        const context = await getCurrentUserContext();
        finalOrgId = context.organization_id;
      }
      
      if (content && !content.trim()) {
        throw new Error('Note content cannot be empty');
      }

      const updateData = {};
      if (content !== undefined) {
        updateData.content = content.trim();
      }

      const updatedNote = await EventNote.update(id, updateData);
      
      // Enrich with user info
      try {
        const user = await User.get(updatedNote.user_id);
        return { ...updatedNote, user };
      } catch (userError) {
        console.warn('Failed to enrich updated note with user info:', userError);
        return updatedNote;
      }
      
    } catch (error) {
      console.error('EventNoteService.update error:', error);
      
      if (error.message.includes('required') || error.message.includes('empty')) {
        toast.error(error.message);
      } else if (error.message.includes('Authentication')) {
        toast.error('Please log in to update notes');
      } else {
        toast.error("Couldn't update note. Please try again.");
      }
      
      throw error;
    }
  },

  async delete({ id, organization_id }) {
    try {
      validateRequired({ id }, ['id']);
      
      // Get organization context if not provided
      let finalOrgId = organization_id;
      if (!finalOrgId) {
        const context = await getCurrentUserContext();
        finalOrgId = context.organization_id;
      }

      await EventNote.delete(id);
      
    } catch (error) {
      console.error('EventNoteService.delete error:', error);
      
      if (error.message.includes('required')) {
        toast.error(error.message);
      } else if (error.message.includes('Authentication')) {
        toast.error('Please log in to delete notes');
      } else {
        toast.error("Couldn't delete note. Please try again.");
      }
      
      throw error;
    }
  }
};