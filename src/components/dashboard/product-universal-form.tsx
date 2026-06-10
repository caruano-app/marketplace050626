"use client";

import { useMemo, useState } from "react";
import type { CategoriaMestre } from "@/types/database";

type ProductUniversalFormProps = {
  categories: CategoriaMestre[];
};

type DynamicField = {
  key: string;
  label: string;
  placeholder: string;
};

const allUnits = ["UN", "KG", "CX", "DZ", "FD", "LT"];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function segmentForCategory(category: CategoriaMestre | undefined) {
  const source = normalize(`${category?.nome_categoria || ""} ${category?.tipo_nicho || ""}`);

  if (/(aliment|bebida|mercado|hortifruti|comida|mercearia|padaria)/.test(source)) return "alimentacao";
  if (/(eletron|eletro|celular|informatica|energia)/.test(source)) return "eletronicos";
  if (/(moda|femin|mascul|infantil|jeans|fitness|camisaria|calcado|textil|confeccao)/.test(source)) return "moda";

  return "geral";
}

function fieldsForSegment(segment: string): DynamicField[] {
  if (segment === "alimentacao") {
    return [
      { key: "validade", label: "Validade", placeholder: "Ex: 30/12/2026" },
      { key: "peso_liquido", label: "Peso Liquido", placeholder: "Ex: 1kg, 500g, 12 unidades" },
      { key: "conservacao", label: "Conservacao", placeholder: "Ex: manter refrigerado" },
    ];
  }

  if (segment === "eletronicos") {
    return [
      { key: "voltagem", label: "Voltagem", placeholder: "Ex: 110V, 220V, bivolt" },
      { key: "potencia", label: "Potencia", placeholder: "Ex: 1200W" },
      { key: "garantia", label: "Garantia", placeholder: "Ex: 12 meses" },
    ];
  }

  if (segment === "moda") {
    return [
      { key: "material_tecido", label: "Material/Tecido", placeholder: "Ex: jeans, algodao, malha" },
      { key: "tipo_gola", label: "Tipo de Gola", placeholder: "Ex: polo, redonda, V" },
      { key: "grade", label: "Grade", placeholder: "Ex: P ao GG, 36 ao 46" },
    ];
  }

  return [
    { key: "marca_modelo", label: "Marca/Modelo", placeholder: "Ex: linha, modelo ou referencia" },
    { key: "material", label: "Material", placeholder: "Ex: plastico, metal, tecido" },
    { key: "observacoes_tecnicas", label: "Observacoes tecnicas", placeholder: "Detalhes importantes do produto" },
  ];
}

function unitsForSegment(segment: string) {
  if (segment === "alimentacao") return ["UN", "KG", "CX", "FD", "LT"];
  if (segment === "moda") return ["UN", "DZ", "FD", "CX"];
  return allUnits;
}

export function ProductUniversalForm({ categories }: ProductUniversalFormProps) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ? String(categories[0].id) : "");
  const selectedCategory = categories.find((category) => String(category.id) === categoryId);
  const segment = segmentForCategory(selectedCategory);
  const dynamicFields = useMemo(() => fieldsForSegment(segment), [segment]);
  const availableUnits = unitsForSegment(segment);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [unitMeasure, setUnitMeasure] = useState(availableUnits[0] || "UN");
  const [retailPrice, setRetailPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [wholesaleMinQuantity, setWholesaleMinQuantity] = useState("");
  const [allowExport, setAllowExport] = useState(true);
  const [technicalSpecs, setTechnicalSpecs] = useState<Record<string, string>>({});
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [suggestionName, setSuggestionName] = useState("");
  const [suggestionNiche, setSuggestionNiche] = useState("");
  const [suggestionContext, setSuggestionContext] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  function updateCategory(nextCategoryId: string) {
    const nextCategory = categories.find((category) => String(category.id) === nextCategoryId);
    const nextSegment = segmentForCategory(nextCategory);
    setCategoryId(nextCategoryId);
    setUnitMeasure(unitsForSegment(nextSegment)[0] || "UN");
    setTechnicalSpecs({});
  }

  async function submitProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("Salvando produto...");

    const response = await fetch("/api/merchant/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categoryId: Number(categoryId),
        categoryName: selectedCategory?.nome_categoria || "",
        name,
        sku,
        description,
        unitMeasure,
        retailPrice: Number(retailPrice.replace(",", ".")),
        wholesalePrice: wholesalePrice ? Number(wholesalePrice.replace(",", ".")) : null,
        wholesaleMinQuantity: wholesaleMinQuantity ? Number(wholesaleMinQuantity) : null,
        allowExport,
        technicalSpecs,
      }),
    });
    const payload = (await response.json()) as { error?: string; id?: string };

    if (!response.ok || payload.error) {
      setStatus(payload.error || "Nao foi possivel salvar o produto.");
      setSaving(false);
      return;
    }

    setStatus("Produto enviado para o catalogo Caruano.");
    setName("");
    setSku("");
    setDescription("");
    setRetailPrice("");
    setWholesalePrice("");
    setWholesaleMinQuantity("");
    setTechnicalSpecs({});
    setSaving(false);
  }

  async function submitSuggestion() {
    setStatus("Enviando sugestao...");
    const response = await fetch("/api/merchant/category-suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: suggestionName,
        niche: suggestionNiche,
        context: suggestionContext,
      }),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok || payload.error) {
      setStatus(payload.error || "Nao foi possivel enviar a sugestao.");
      return;
    }

    setStatus("Sugestao enviada para analise do Admin.");
    setSuggestionOpen(false);
    setSuggestionName("");
    setSuggestionNiche("");
    setSuggestionContext("");
  }

  return (
    <>
      <form className="space-y-4" onSubmit={submitProduct}>
        <div className="sticky top-0 z-20 rounded-b-[12px] border border-neutral-200 bg-white/95 p-4 shadow-sm backdrop-blur">
          <p className="text-xs font-black uppercase text-[#f58220]">Catalogo universal</p>
          <h1 className="text-2xl font-black uppercase text-neutral-950">Novo produto</h1>
          <p className="mt-1 text-sm font-bold text-neutral-600">Escolha a categoria oficial do Caruano e preencha apenas os dados que combinam com o produto.</p>
        </div>

        <section className="rounded-[12px] bg-white p-4 shadow-sm">
          <label className="block text-sm font-black uppercase text-neutral-950">
            Categoria oficial
            <select className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 bg-white px-3 text-base font-bold outline-none" onChange={(event) => updateCategory(event.target.value)} value={categoryId}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nome_categoria}
                </option>
              ))}
            </select>
          </label>
          <button className="mt-3 text-sm font-black text-[#f58220] underline" onClick={() => setSuggestionOpen(true)} type="button">
            Nao encontrou sua categoria? Sugira aqui
          </button>
        </section>

        <section className="rounded-[12px] bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-black uppercase text-neutral-950">
              Nome do produto
              <input className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-base outline-none" onChange={(event) => setName(event.target.value)} value={name} />
            </label>
            <label className="text-sm font-black uppercase text-neutral-950">
              Codigo/SKU
              <input className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-base outline-none" onChange={(event) => setSku(event.target.value)} value={sku} />
            </label>
          </div>
          <label className="mt-4 block text-sm font-black uppercase text-neutral-950">
            Descricao
            <textarea className="mt-2 min-h-28 w-full rounded-[8px] border border-neutral-300 p-3 text-base outline-none" onChange={(event) => setDescription(event.target.value)} value={description} />
          </label>
        </section>

        <section className="rounded-[12px] bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black uppercase text-neutral-950">Unidades e preco</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-4">
            <label className="text-sm font-black uppercase text-neutral-950">
              Unidade
              <select className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 bg-white px-3 text-base font-bold outline-none" onChange={(event) => setUnitMeasure(event.target.value)} value={unitMeasure}>
                {availableUnits.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-black uppercase text-neutral-950">
              Preco unitario
              <input className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-base outline-none" inputMode="decimal" onChange={(event) => setRetailPrice(event.target.value)} placeholder="0,00" value={retailPrice} />
            </label>
            <label className="text-sm font-black uppercase text-neutral-950">
              Preco atacado
              <input className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-base outline-none" inputMode="decimal" onChange={(event) => setWholesalePrice(event.target.value)} placeholder="0,00" value={wholesalePrice} />
            </label>
            <label className="text-sm font-black uppercase text-neutral-950">
              Minimo atacado
              <input className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-base outline-none" inputMode="numeric" onChange={(event) => setWholesaleMinQuantity(event.target.value)} placeholder="Ex: 12" value={wholesaleMinQuantity} />
            </label>
          </div>
        </section>

        <section className="rounded-[12px] bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black uppercase text-neutral-950">Campos especificos: {selectedCategory?.nome_categoria || "Categoria"}</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {dynamicFields.map((field) => (
              <label className="text-sm font-black uppercase text-neutral-950" key={field.key}>
                {field.label}
                <input
                  className="mt-2 h-12 w-full rounded-[8px] border border-neutral-300 px-3 text-base outline-none"
                  onChange={(event) => setTechnicalSpecs((current) => ({ ...current, [field.key]: event.target.value }))}
                  placeholder={field.placeholder}
                  value={technicalSpecs[field.key] || ""}
                />
              </label>
            ))}
          </div>
          <label className="mt-4 flex min-h-12 items-center gap-3 rounded-[8px] bg-neutral-100 px-3 text-sm font-black uppercase text-neutral-950">
            <input checked={allowExport} onChange={(event) => setAllowExport(event.target.checked)} type="checkbox" />
            Quero preparar este produto para exportacao futura. EAN-13 sera exigido nas variacoes.
          </label>
        </section>

        <button className="min-h-12 w-full rounded-[8px] bg-[#FFD700] px-4 text-sm font-black uppercase text-neutral-950 shadow-sm disabled:opacity-60" disabled={saving} type="submit">
          {saving ? "Salvando..." : "Salvar produto"}
        </button>
        {status ? <p className="rounded-[8px] bg-white p-3 text-center text-sm font-black text-neutral-700">{status}</p> : null}
      </form>

      {suggestionOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 md:place-items-center">
          <div className="w-full rounded-t-[18px] bg-white p-5 shadow-xl md:max-w-[520px] md:rounded-[14px]">
            <h2 className="text-2xl font-black uppercase text-neutral-950">Sugerir categoria</h2>
            <input className="mt-4 h-12 w-full rounded-[8px] border border-neutral-300 px-3 outline-none" onChange={(event) => setSuggestionName(event.target.value)} placeholder="Nome da categoria" value={suggestionName} />
            <input className="mt-3 h-12 w-full rounded-[8px] border border-neutral-300 px-3 outline-none" onChange={(event) => setSuggestionNiche(event.target.value)} placeholder="Nicho/segmento" value={suggestionNiche} />
            <textarea className="mt-3 min-h-24 w-full rounded-[8px] border border-neutral-300 p-3 outline-none" onChange={(event) => setSuggestionContext(event.target.value)} placeholder="Explique onde essa categoria sera usada" value={suggestionContext} />
            <button className="mt-3 min-h-12 w-full rounded-[8px] bg-[#FFD700] font-black uppercase text-neutral-950" onClick={submitSuggestion} type="button">
              Enviar sugestao
            </button>
            <button className="mt-2 min-h-12 w-full rounded-[8px] bg-neutral-950 font-black uppercase text-white" onClick={() => setSuggestionOpen(false)} type="button">
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
