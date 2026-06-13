'use client';

import React from 'react';
import AdminMasterShell from '@/components/admin/admin-master-shell';
import AdminControlTower from '@/components/admin/admin-control-tower';

export default function AdminPage() {
  return (
    <AdminMasterShell>
      <AdminControlTower />
    </AdminMasterShell>
  );
}
