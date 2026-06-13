'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminMasterShell from '@/components/admin/admin-master-shell';
import AdminControlTower from '@/components/admin/admin-control-tower';
import AdminCatalogPanel from '@/components/admin/admin-catalog-panel';
import AdminAppearancePanel from '@/components/admin/admin-appearance-panel';

function AdminContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  if (tab === 'catalogo') return <AdminCatalogPanel />;
  if (tab === 'aparencia') return <AdminAppearancePanel />;
  
  return <AdminControlTower />;
}

export default function AdminPage() {
  return (
    <AdminMasterShell>
      <Suspense fallback={<div className="p-8 text-black">Carregando...</div>}>
        <AdminContent />
      </Suspense>
    </AdminMasterShell>
  );
}
