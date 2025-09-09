class LiveEventBus {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(camera_id, callback) {
    if (!this.subscribers.has(camera_id)) {
      this.subscribers.set(camera_id, new Set());
    }
    
    this.subscribers.get(camera_id).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(camera_id);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(camera_id);
        }
      }
    };
  }

  emit(camera_id, event) {
    const callbacks = this.subscribers.get(camera_id);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Event bus callback error:', error);
        }
      });
    }
  }

  unsubscribe(camera_id, callback) {
    const callbacks = this.subscribers.get(camera_id);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscribers.delete(camera_id);
      }
    }
  }

  clear() {
    this.subscribers.clear();
  }
}

// Export singleton instance
export const liveEventBus = new LiveEventBus();