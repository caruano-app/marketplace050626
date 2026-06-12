"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminCategory, AdminSubcategory } from "@/lib/data/admin-catalog";

type AdminCatalogPanelProps = {
  categories: AdminCategory[];
  subcategories: AdminSubcategory[];
};

type CategoryDraft = {
  nome_categoria: string;
  slug_categoria: string;
  tipo_nicho: string;
};

type SubcategoryDraft = {
  categoria_id: number;
  nome_subcategoria: string;
  slug_subcategoria: string;
};

function categoryFromDraft(category?: AdminCategory): CategoryDraft {
  return {
    nome_categoria: category?.nome_categoria || "",
    slug_categoria: category?.slug_categoria || "",
    tipo_nicho: category?.tipo_nicho || "geral",
  };
}

function subcategoryFromDraft(subcategory?: AdminSubcategory, firstCategoryId = 0): SubcategoryDraft {
  return {
    categoria_id: subcategory?.categoria_id || firstCategoryId,
    nome_subcategoria: subcategory?.nome_subcategoria || "",
    slug_subcategoria: subcategory?.slug_subcategoria || "",
  };
}

function categoryName(category: AdminSubcategory["categorias_mestre"]) {
  const row = Array.isArray(category) ? category[0] : category;
  return row?.nome_categoria || "Categoria";
}

export function AdminCatalogPanel({ categories, subcategories }: AdminCatalogPanelProps) {
  const router = useRouter();
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(categoryFromDraft());
  const [subcategoryDraft, setSubcategoryDraft] = useState<SubcategoryDraft>(subcategoryFromDraft(undefined, categories[0]?.id || 0));
  const [editingCategories, setEditingCategories] = useState<Record<number, CategoryDraft>>(() =>
    Object.fromEntries(categories.map((category) => [category.id, categoryFromDraft(category)])),
  );
  const [editingSubcategories, setEditingSubcategories] = useState<Record<number, SubcategoryDraft>>(() =>
    Object.fromEntries(subcategories.map((subcategory) => [subcategory.id, subcategoryFromDraft(subcategory, categories[0]?.id || 0)])),
  );
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const categoryOptions = useMemo(() => categories.map((category) => ({
    id: category.id,
    label: category.nome_categoria,
  })), [categories]);

  function refreshCatalog(messageText: string) {
    setMessage(messageText);
    router.refresh();
  }

  function requestJson(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
    return fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  function createCategory() {
    setMessage("Criando categoria...");
    startTransition(async () => {
      const response = await requestJson("/api/admin/catalog/categories", "POST", categoryDraft);
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error || "Nao foi possivel criar categoria.");
        return;
      }
      setCategoryDraft(categoryFromDraft());
      refreshCatalog("Categoria criada. O Header passa a listar no proximo carregamento.");
    });
  }

  function updateCategory(id: number) {
    setMessage("Atualizando categoria...");
    startTransition(async () => {
      const response = await requestJson(`/api/admin/catalog/categories/${id}`, "PATCH", editingCategories[id]);
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error || "Nao foi possivel atualizar categoria.");
        return;
      }
      refreshCatalog("Categoria atualizada.");
    });
  }

  function deleteCategory(id: number) {
    if (!window.confirm("Excluir esta categoria? O banco pode bloquear se houver produtos vinculados.")) return;
    setMessage("Excluindo categoria...");
    startTransition(async () => {
      const response = await requestJson(`/api/admin/catalog/categories/${id}`, "DELETE");
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error || "Nao foi possivel excluir categoria.");
        return;
      }
      refreshCatalog("Categoria excluida.");
    });
  }

  function createSubcategory() {
    setMessage("Criando subcategoria...");
    startTransition(async () => {
      const response = await requestJson("/api/admin/catalog/subcategories", "POST", subcategoryDraft);
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error || "Nao foi possivel criar subcategoria.");
        return;
      }
      setSubcategoryDraft(subcategoryFromDraft(undefined, categories[0]?.id || 0));
      refreshCatalog("Subcategoria criada.");
    });
  }

  function updateSubcategory(id: number) {
    setMessage("Atualizando subcategoria...");
    startTransition(async () => {
      const response = await requestJson(`/api/admin/catalog/subcategories/${id}`, "PATCH", editingSubcategories[id]);
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error || "Nao foi possivel atualizar subcategoria.");
        return;
      }
      refreshCatalog("Subcategoria atualizada.");
    });
  }

  function deleteSubcategory(id: number) {
    if (!window.confirm("Excluir esta subcategoria? O banco pode bloquear se houver produtos vinculados.")) return;
    setMessage("Excluindo subcategoria...");
    startTransition(async () => {
      const response = await requestJson(`/api/admin/catalog/subcategories/${id}`, "DELETE");
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error || "Nao foi possivel excluir subcategoria.");
        return;
      }
      refreshCatalog("Subcategoria excluida.");
    });
  }

  return (
    <section className="rounded-[8px] bg-white p-4 shadow-sm" id="admin-catalogo">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-orange-600">Catalogo</p>
          <h2 className="mt-1 text-xl font-black uppercase text-neutral-950">Categorias e subcategorias</h2>
          <p className="mt-1 text-sm font-bold text-neutral-600">Os lojistas selecionam esta arvore mestre. Eles nao criam categorias.</p>
        </div>
        <span className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-black uppercase text-neutral-600">
          {categories.length} categorias
        </span>
      </div>

      <div className="mt-4 grid gap-3 rounded-[8px] border border-neutral-200 bg-neutral-50 p-3 lg:grid-cols-[1fr_1fr_180px]">
        <label className="text-xs font-black uppercase text-neutral-600">
          Nova categoria
          <input
            className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-sm font-bold text-neutral-950"
            onChange={(event) => setCategoryDraft((current) => ({ ...current, nome_categoria: event.target.value }))}
            placeholder="Ex: Alimentos"
            value={categoryDraft.nome_categoria}
          />
        </label>
        <label className="text-xs font-black uppercase text-neutral-600">
          Nicho / icone visual
          <input
            className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-sm font-bold text-neutral-950"
            onChange={(event) => setCategoryDraft((current) => ({ ...current, tipo_nicho: event.target.value }))}
            placeholder="alimentacao"
            value={categoryDraft.tipo_nicho}
          />
        </label>
        <button
          className="min-h-11 self-end rounded-[8px] bg-[var(--primary)] px-4 text-sm font-black uppercase text-neutral-950 transition active:scale-[0.98] disabled:opacity-60"
          disabled={isPending}
          onClick={createCategory}
          type="button"
        >
          Criar
        </button>
      </div>

      <div className="mt-4 grid gap-2">
        {categories.map((category) => {
          const draft = editingCategories[category.id] || categoryFromDraft(category);
          return (
            <div className="grid gap-2 rounded-[8px] border border-neutral-200 p-3 lg:grid-cols-[1.3fr_1fr_1fr_110px_110px]" key={category.id}>
              <input
                className="h-11 rounded-[8px] border border-neutral-300 px-3 text-sm font-bold"
                onChange={(event) => setEditingCategories((current) => ({ ...current, [category.id]: { ...draft, nome_categoria: event.target.value } }))}
                value={draft.nome_categoria}
              />
              <input
                className="h-11 rounded-[8px] border border-neutral-300 px-3 text-sm font-bold"
                onChange={(event) => setEditingCategories((current) => ({ ...current, [category.id]: { ...draft, slug_categoria: event.target.value } }))}
                value={draft.slug_categoria}
              />
              <input
                className="h-11 rounded-[8px] border border-neutral-300 px-3 text-sm font-bold"
                onChange={(event) => setEditingCategories((current) => ({ ...current, [category.id]: { ...draft, tipo_nicho: event.target.value } }))}
                value={draft.tipo_nicho}
              />
              <button className="min-h-11 rounded-[8px] bg-neutral-950 px-3 text-xs font-black uppercase text-white" onClick={() => updateCategory(category.id)} type="button">
                Salvar
              </button>
              <button className="min-h-11 rounded-[8px] border border-red-300 px-3 text-xs font-black uppercase text-red-700" onClick={() => deleteCategory(category.id)} type="button">
                Excluir
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-3 rounded-[8px] border border-neutral-200 bg-neutral-50 p-3 lg:grid-cols-[1fr_1fr_180px]">
        <label className="text-xs font-black uppercase text-neutral-600">
          Categoria
          <select
            className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-sm font-bold text-neutral-950"
            onChange={(event) => setSubcategoryDraft((current) => ({ ...current, categoria_id: Number(event.target.value) }))}
            value={subcategoryDraft.categoria_id}
          >
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-black uppercase text-neutral-600">
          Nova subcategoria
          <input
            className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-sm font-bold text-neutral-950"
            onChange={(event) => setSubcategoryDraft((current) => ({ ...current, nome_subcategoria: event.target.value }))}
            placeholder="Ex: Queijos"
            value={subcategoryDraft.nome_subcategoria}
          />
        </label>
        <button
          className="min-h-11 self-end rounded-[8px] bg-[var(--primary)] px-4 text-sm font-black uppercase text-neutral-950 transition active:scale-[0.98] disabled:opacity-60"
          disabled={isPending || !categoryOptions.length}
          onClick={createSubcategory}
          type="button"
        >
          Criar sub
        </button>
      </div>

      <div className="mt-4 grid gap-2">
        {subcategories.map((subcategory) => {
          const draft = editingSubcategories[subcategory.id] || subcategoryFromDraft(subcategory, categories[0]?.id || 0);
          return (
            <div className="grid gap-2 rounded-[8px] border border-neutral-200 p-3 lg:grid-cols-[1fr_1.2fr_1fr_110px_110px]" key={subcategory.id}>
              <select
                className="h-11 rounded-[8px] border border-neutral-300 px-3 text-sm font-bold"
                onChange={(event) => setEditingSubcategories((current) => ({ ...current, [subcategory.id]: { ...draft, categoria_id: Number(event.target.value) } }))}
                value={draft.categoria_id}
              >
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
              <input
                className="h-11 rounded-[8px] border border-neutral-300 px-3 text-sm font-bold"
                onChange={(event) => setEditingSubcategories((current) => ({ ...current, [subcategory.id]: { ...draft, nome_subcategoria: event.target.value } }))}
                value={draft.nome_subcategoria}
              />
              <input
                className="h-11 rounded-[8px] border border-neutral-300 px-3 text-sm font-bold"
                onChange={(event) => setEditingSubcategories((current) => ({ ...current, [subcategory.id]: { ...draft, slug_subcategoria: event.target.value } }))}
                placeholder={categoryName(subcategory.categorias_mestre)}
                value={draft.slug_subcategoria}
              />
              <button className="min-h-11 rounded-[8px] bg-neutral-950 px-3 text-xs font-black uppercase text-white" onClick={() => updateSubcategory(subcategory.id)} type="button">
                Salvar
              </button>
              <button className="min-h-11 rounded-[8px] border border-red-300 px-3 text-xs font-black uppercase text-red-700" onClick={() => deleteSubcategory(subcategory.id)} type="button">
                Excluir
              </button>
            </div>
          );
        })}
      </div>

      {message ? <p className="mt-3 rounded-[6px] bg-neutral-100 p-3 text-sm font-black text-neutral-700">{message}</p> : null}
    </section>
  );
}
