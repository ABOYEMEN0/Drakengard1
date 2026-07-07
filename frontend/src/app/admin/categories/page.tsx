"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { Check, FolderTree, Pencil, Plus, Trash2, X } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { Category, CategorySlug } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminCategoriesPage() {
  const push = useToast((s) => s.push);
  const [categories, setCategories] = useState<Category[]>(() => CATEGORIES.map((c) => ({ ...c })));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addNameAr, setAddNameAr] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addError, setAddError] = useState("");

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDescription(c.description);
  }

  function saveEdit(id: string) {
    if (!editName.trim()) return;
    setCategories((cs) =>
      cs.map((c) => (c.id === id ? { ...c, name: editName.trim(), description: editDescription.trim() } : c))
    );
    setEditingId(null);
    push("Category updated");
  }

  function remove(c: Category) {
    if (!window.confirm(`Delete category "${c.name}"? Its ${c.productCount} products will be uncategorised.`)) return;
    setCategories((cs) => cs.filter((x) => x.id !== c.id));
    push(`${c.name} deleted`);
  }

  function addCategory(e: FormEvent) {
    e.preventDefault();
    if (!addName.trim()) {
      setAddError("Name is required.");
      return;
    }
    const slug = slugify(addName);
    const created: Category = {
      id: `cat-new-${Date.now()}`,
      slug: slug as CategorySlug,
      name: addName.trim(),
      nameAr: addNameAr.trim(),
      description: addDescription.trim(),
      image: "/images/categories/coffee.svg",
      productCount: 0,
    };
    setCategories((cs) => [...cs, created]);
    push(`${created.name} created`);
    setShowAdd(false);
    setAddName("");
    setAddNameAr("");
    setAddDescription("");
    setAddError("");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Catalog</p>
          <h1 className="font-display text-3xl font-medium text-navy sm:text-4xl">Categories</h1>
          <p className="mt-1 text-sm text-muted">{categories.length} categories</p>
        </div>
        <Button variant="gold" size="sm" onClick={() => setShowAdd((v) => !v)}>
          <Plus size={15} /> Add category
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={addCategory} className="card-luxe space-y-4 p-6" aria-label="Add category">
          <h2 className="font-display text-xl font-medium text-navy">New Category</h2>
          {addError && (
            <p role="alert" className="rounded-card bg-[#FBE4E2] px-4 py-3 text-sm font-medium text-[#B42318]">
              {addError}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Name" htmlFor="cat-name" required>
              <Input id="cat-name" value={addName} onChange={(e) => setAddName(e.target.value)} />
            </Field>
            <Field label="Name (Arabic)" htmlFor="cat-nameAr">
              <Input id="cat-nameAr" dir="rtl" value={addNameAr} onChange={(e) => setAddNameAr(e.target.value)} />
            </Field>
            <Field label="Slug" htmlFor="cat-slug" hint="auto-generated">
              <Input id="cat-slug" value={slugify(addName)} readOnly className="bg-ivory" />
            </Field>
          </div>
          <Field label="Description" htmlFor="cat-desc">
            <Textarea id="cat-desc" value={addDescription} onChange={(e) => setAddDescription(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm">
              Create category
            </Button>
          </div>
        </form>
      )}

      {categories.length === 0 ? (
        <div className="card-luxe">
          <EmptyState icon={FolderTree} title="No categories" description="Add your first category to organise the catalog." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="card-luxe overflow-hidden">
              <div className="relative h-36 bg-ivory">
                <Image src={c.image} alt={c.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="space-y-3 p-5">
                {editingId === c.id ? (
                  <div className="space-y-3">
                    <Field label="Name" htmlFor={`edit-name-${c.id}`} required>
                      <Input id={`edit-name-${c.id}`} value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </Field>
                    <Field label="Description" htmlFor={`edit-desc-${c.id}`}>
                      <Textarea id={`edit-desc-${c.id}`} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                    </Field>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        <X size={14} /> Cancel
                      </Button>
                      <Button variant="gold" size="sm" onClick={() => saveEdit(c.id)}>
                        <Check size={14} /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display text-lg font-medium text-navy">{c.name}</h2>
                        {c.nameAr && (
                          <p dir="rtl" className="text-sm text-muted">
                            {c.nameAr}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full bg-navy/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider2 text-navy">
                        {c.productCount} products
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted">{c.description}</p>
                    <div className="flex justify-end gap-1 border-t border-line pt-3">
                      <button
                        onClick={() => startEdit(c)}
                        aria-label={`Edit ${c.name}`}
                        className="rounded-button p-2 text-navy hover:bg-navy/5"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => remove(c)}
                        aria-label={`Delete ${c.name}`}
                        className="rounded-button p-2 text-[#B42318] hover:bg-[#FBE4E2]"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
