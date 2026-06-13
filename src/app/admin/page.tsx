'use client';
import React, { Suspense } from 'react';
import AdminMasterShell from '@/components/admin/admin-master-shell';
import AdminControlTower from '@/components/admin/admin-control-tower';

export default function AdminPage() {
  return (
    <AdminMasterShell>
      <Suspense fallback={<div className="p-8 text-black font-bold">CARREGANDO...</div>}>
        <AdminControlTower />
      </Suspense>
    </AdminMasterShell>
  );
}
