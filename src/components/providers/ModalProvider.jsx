import React, { createContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

export const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modals, setModals] = useState([]);

  const showModal = useCallback((Component, props = {}) => {
    const modalId = Date.now().toString();
    setModals(prev => [...prev, { id: modalId, Component, props }]);
    return modalId;
  }, []);

  const hideModal = useCallback((id) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);

  const contextValue = { showModal, hideModal };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <AnimatePresence>
        {modals.map(({ id, Component, props }) => (
          <Component key={id} {...props} isOpen={true} onClose={() => hideModal(id)} />
        ))}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}