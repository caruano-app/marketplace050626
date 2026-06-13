'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminMasterShell from '@/components/admin/admin-master-shell';
import AdminControlTower from '@/components/admin/admin-control-tower';
import AdminCatalogPanel from '@/components/admin/admin-catalog-panel';
import AdminAppearancePanel from '@/components/admin/admin-appearance-panel';
import AdminContentPanel from '@/components/admin/admin-content-panel';

function AdminContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  // Lógica de troca de "Frames"
  switch (tab) {
    case 'catalogo':
      return <AdminCatalogPanel />;
    case 'aparencia':
      return <AdminAppearancePanel />;
    case 'conteudo':
      return <AdminContentPanel />;
    // Adicione outros cases conforme criarmos os painéis
    default:
      return <AdminControlTower />;
  }
}

export default function AdminPage() {
  return (
    <AdminMasterShell>
      <Suspense fallback={<div className="p-8 animate-pulse text-black">Carregando módulo...</div>}>
        <AdminContent />
      </Suspense>
    </AdminMasterShell>
  );
}
