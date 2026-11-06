import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { SidebarProvider } from '../../context/SidebarContext';

export const AdminLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-stone-100 font-sans">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

