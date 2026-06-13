'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminMasterShell from '@/components/admin/admin-master-shell';
import AdminControlTower from '@/components/admin/admin-control-tower';
import AdminCatalogPanel from '@/components/admin/admin-catalog-panel';
import AdminAppearancePanel from '@/components/admin/admin-appearance-panel';

// Componente que decide o que mostrar no "Frame"
function AdminContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  if (tab === 'catalogo') return <AdminCatalogPanel />;
  if (tab === 'aparencia') return <AdminAppearancePanel />;
  
  // Se não tiver tab ou for dashboard, mostra a Torre de Controle
  return <AdminControlTower />;
}

export default function AdminPage() {
  return (
    <AdminMasterShell>
      {/* O Suspense é OBRIGATÓRIO no Next.js para usar useSearchParams */}
      <Suspense fallback={<div className="p-8 text-black font-bold animate-pulse">Carregando módulo...</div>}>
        <AdminContent />
      </Suspense>
    </AdminMasterShell>
  );
}
