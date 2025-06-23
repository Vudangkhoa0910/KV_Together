'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminViewContextType {
  isViewAsUser: boolean;
  toggleViewAsUser: () => void;
  setViewAsUser: (value: boolean) => void;
}

const AdminViewContext = createContext<AdminViewContextType | undefined>(undefined);

export function AdminViewProvider({ children }: { children: React.ReactNode }) {
  const [isViewAsUser, setIsViewAsUser] = useState(false);

  // Persist view mode in localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('adminViewAsUser');
    if (savedViewMode === 'true') {
      setIsViewAsUser(true);
    }
  }, []);

  const setViewAsUser = (value: boolean) => {
    setIsViewAsUser(value);
    localStorage.setItem('adminViewAsUser', value.toString());
  };

  const toggleViewAsUser = () => {
    setViewAsUser(!isViewAsUser);
  };

  return (
    <AdminViewContext.Provider value={{
      isViewAsUser,
      toggleViewAsUser,
      setViewAsUser,
    }}>
      {children}
    </AdminViewContext.Provider>
  );
}

export function useAdminView() {
  const context = useContext(AdminViewContext);
  if (context === undefined) {
    throw new Error('useAdminView must be used within an AdminViewProvider');
  }
  return context;
}
