"use client";

import { FormEvent, useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Address } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const STORAGE_KEY = "leor-addresses";

const SEED: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    name: "LEOR Customer",
    phone: "+966 50 000 0000",
    city: "Riyadh",
    district: "Al Olaya",
    address: "King Fahd Road, Building 12, Apt 4",
    isDefault: true,
  },
];

type FormValues = Omit<Address, "id" | "isDefault">;

const EMPTY_FORM: FormValues = {
  label: "",
  name: "",
  phone: "",
  city: "",
  district: "",
  address: "",
};

export function AddressesClient() {
  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null); // "new" for add
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const toast = useToast((s) => s.push);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Address[]) : [];
      setAddresses(parsed.length > 0 ? parsed : SEED);
    } catch {
      setAddresses(SEED);
    }
    setMounted(true);
  }, []);

  const save = (next: Address[]) => {
    setAddresses(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const startEdit = (a: Address) => {
    setEditingId(a.id);
    setForm({
      label: a.label,
      name: a.name,
      phone: a.phone,
      city: a.city,
      district: a.district,
      address: a.address,
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (editingId === "new") {
      save([
        ...addresses,
        { ...form, id: `addr-${Date.now()}`, isDefault: addresses.length === 0 },
      ]);
      toast("Address added");
    } else if (editingId) {
      save(addresses.map((a) => (a.id === editingId ? { ...a, ...form } : a)));
      toast("Address updated");
    }
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const setDefault = (id: string) => {
    save(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
    toast("Default address updated");
  };

  const remove = (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    const next = addresses.filter((a) => a.id !== id);
    if (next.length > 0 && !next.some((a) => a.isDefault)) next[0].isDefault = true;
    save(next);
    toast("Address deleted", "info");
  };

  const set = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const formCard = (title: string) => (
    <form onSubmit={submit} className="card-luxe space-y-4 p-6">
      <h2 className="font-display text-lg font-medium text-navy">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label" htmlFor="addr-label" required>
          <Input id="addr-label" value={form.label} onChange={set("label")} required placeholder="Home, Office…" />
        </Field>
        <Field label="Full name" htmlFor="addr-name" required>
          <Input id="addr-name" value={form.name} onChange={set("name")} required />
        </Field>
        <Field label="Phone" htmlFor="addr-phone" required>
          <Input id="addr-phone" type="tel" value={form.phone} onChange={set("phone")} required />
        </Field>
        <Field label="City" htmlFor="addr-city" required>
          <Input id="addr-city" value={form.city} onChange={set("city")} required />
        </Field>
        <Field label="District" htmlFor="addr-district" required>
          <Input id="addr-district" value={form.district} onChange={set("district")} required />
        </Field>
        <Field label="Street address" htmlFor="addr-address" required>
          <Input id="addr-address" value={form.address} onChange={set("address")} required />
        </Field>
      </div>
      <div className="flex gap-3">
        <Button type="submit" variant="gold">Save address</Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setEditingId(null);
            setForm(EMPTY_FORM);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Address book</p>
          <h1 className="heading-md">Addresses</h1>
        </div>
        {editingId === null && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingId("new");
              setForm(EMPTY_FORM);
            }}
          >
            <Plus size={15} /> Add address
          </Button>
        )}
      </header>

      {!mounted ? (
        <div className="skeleton h-40 w-full" aria-hidden />
      ) : (
        <div className="space-y-4">
          {editingId === "new" && formCard("New address")}
          {addresses.map((a) =>
            editingId === a.id ? (
              <div key={a.id}>{formCard(`Edit ${a.label}`)}</div>
            ) : (
              <div key={a.id} className="card-luxe flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/5">
                    <MapPin size={16} className="text-gold-600" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium text-navy">{a.label}</span>
                      {a.isDefault && <Badge variant="gold">Default</Badge>}
                    </div>
                    <p className="text-sm text-muted">
                      {a.name} · {a.phone}
                      <br />
                      {a.city}, {a.district}
                      <br />
                      {a.address}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!a.isDefault && (
                    <Button variant="ghost" size="sm" onClick={() => setDefault(a.id)}>
                      <Star size={14} /> Set default
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" aria-label={`Edit ${a.label}`} onClick={() => startEdit(a)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete ${a.label}`}
                    className="text-[#B42318] hover:bg-[#FBE4E2]"
                    onClick={() => remove(a.id)}
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
