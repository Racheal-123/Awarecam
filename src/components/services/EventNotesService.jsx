import { EventNote } from '@/api/entities';
import { User } from '@/api/entities';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const getCurrentUserOrg = async () => {
  try {
    const user = await User.me();
    return { id: user.organization_id, user };
  } catch (error) {
    console.error('Failed to get current user context:', error);
    return null;
  }
};

const ensureOrg = async (organization_id) => {
  if (organization_id) return organization_id;
  
  const context = await getCurrentUserOrg();
  if (!context?.id) {
    throw new Error("Missing organization_id context - user must be authenticated");
  }
  return context.id;
};

const withOrgFilter = async (organization_id, extra = {}) => ({
  organization_id: await ensureOrg(organization_id),
  ...extra,
});

export const EventNotesService = {
  async listByEvent({ event_id, organization_id, limit = 50 }) {
    assert(event_id, "event_id is required");
    
    try {
      const filter = await withOrgFilter(organization_id, { event_id });
      const notes = await EventNote.filter(filter, '-created_date', limit);
      
      // Enrich notes with user information
      const enrichedNotes = await Promise.all(
        notes.map(async (note) => {
          try {
            const user = await User.get(note.user_id);
            return { ...note, user };
          } catch (error) {
            console.warn(`Failed to load user ${note.user_id}:`, error);
            return { ...note, user: { full_name: 'Unknown User', email: '' } };
          }
        })
      );
      
      return enrichedNotes;
    } catch (error) {
      console.error('EventNotesService.listByEvent error:', error);
      throw error;
    }
  },

  async create({ event_id, content, is_internal = false, attachments = [], organization_id, location_id, user_id }) {
    assert(event_id, "event_id is required");
    assert(content?.trim(), "content is required");
    
    try {
      // Get user context if not provided
      let finalUserId = user_id;
      let finalOrgId = organization_id;
      
      if (!finalUserId || !finalOrgId) {
        const context = await getCurrentUserOrg();
        if (!context) {
          throw new Error("User authentication required");
        }
        finalUserId = finalUserId || context.user.id;
        finalOrgId = finalOrgId || context.id;
      }

      const payload = {
        organization_id: finalOrgId,
        location_id,
        event_id,
        user_id: finalUserId,
        content: content.trim(),
        is_internal,
        attachments: attachments || []
      };

      const created = await EventNote.create(payload);
      
      // Enrich with user info
      try {
        const user = await User.get(created.user_id);
        return { ...created, user };
      } catch (error) {
        console.warn('Failed to enrich created note with user info:', error);
        return created;
      }
    } catch (error) {
      console.error('EventNotesService.create error:', error);
      throw error;
    }
  },

  async update({ id, content, pinned, is_internal, attachments, organization_id }) {
    assert(id, "id is required");
    
    try {
      const orgId = await ensureOrg(organization_id);
      
      const patch = {};
      if (content !== undefined) patch.content = content.trim();
      if (pinned !== undefined) patch.pinned = pinned;
      if (is_internal !== undefined) patch.is_internal = is_internal;
      if (attachments !== undefined) patch.attachments = attachments;

      const updated = await EventNote.update(id, patch);
      
      // Enrich with user info
      try {
        const user = await User.get(updated.user_id);
        return { ...updated, user };
      } catch (error) {
        console.warn('Failed to enrich updated note with user info:', error);
        return updated;
      }
    } catch (error) {
      console.error('EventNotesService.update error:', error);
      throw error;
    }
  },

  async remove({ id, organization_id }) {
    assert(id, "id is required");
    
    try {
      const orgId = await ensureOrg(organization_id);
      return await EventNote.delete(id);
    } catch (error) {
      console.error('EventNotesService.remove error:', error);
      throw error;
    }
  },

  async canUserEdit(note, currentUser) {
    if (!note || !currentUser) return false;
    
    // Users can edit their own notes
    if (note.user_id === currentUser.id) return true;
    
    // Admins and managers can edit any notes in their org
    const userRole = currentUser.role?.toLowerCase() || '';
    return ['admin', 'organization_admin', 'manager'].includes(userRole);
  },

  async canUserDelete(note, currentUser) {
    if (!note || !currentUser) return false;
    
    // Users can delete their own notes
    if (note.user_id === currentUser.id) return true;
    
    // Admins and managers can delete any notes in their org
    const userRole = currentUser.role?.toLowerCase() || '';
    return ['admin', 'organization_admin', 'manager'].includes(userRole);
  }
};