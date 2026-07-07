"use client";

import { useState } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Reveal } from "@/components/ui/reveal";
import { useToast } from "@/components/ui/toast";
import { STORE_WHATSAPP } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactClient() {
  const toast = useToast((s) => s.push);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "general", message: "" });
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "message", string>>>({});
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.message.trim().length < 10) next.message = "Tell us a little more (at least 10 characters).";
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setSent(true);
    toast("Message received — we'll reply within one business day.");
  };

  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mb-12 text-center">
        <p className="eyebrow mb-3">We&apos;re listening</p>
        <h1 className="heading-xl">Contact LEOR</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <div className="card-luxe h-full p-8">
            <h2 className="heading-md mb-6">The Maison</h2>
            <ul className="space-y-5 text-sm">
              <li className="flex gap-3.5">
                <MapPin size={18} className="mt-0.5 shrink-0 text-gold-600" />
                <span>
                  <span className="block font-medium text-navy">Visit</span>
                  <span className="text-muted">Olaya District, Riyadh, Saudi Arabia</span>
                </span>
              </li>
              <li className="flex gap-3.5">
                <Phone size={18} className="mt-0.5 shrink-0 text-gold-600" />
                <span>
                  <span className="block font-medium text-navy">Call</span>
                  <a href="tel:+966500000000" className="text-muted hover:text-gold-700">+966 50 000 0000</a>
                </span>
              </li>
              <li className="flex gap-3.5">
                <Mail size={18} className="mt-0.5 shrink-0 text-gold-600" />
                <span>
                  <span className="block font-medium text-navy">Write</span>
                  <a href="mailto:care@leor.sa" className="text-muted hover:text-gold-700">care@leor.sa</a>
                </span>
              </li>
              <li className="flex gap-3.5">
                <Clock size={18} className="mt-0.5 shrink-0 text-gold-600" />
                <span>
                  <span className="block font-medium text-navy">Hours</span>
                  <span className="text-muted">Sat–Thu, 9:00–22:00 · Fri, 16:00–22:00</span>
                </span>
              </li>
            </ul>

            <a
              href={`https://wa.me/${STORE_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-button bg-[#25D366] text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>

            <div className="mt-8 flex aspect-[4/2.2] items-center justify-center rounded-card bg-navy">
              <div className="text-center">
                <MapPin size={26} className="mx-auto mb-2 text-gold" />
                <p className="text-xs uppercase tracking-wider2 text-ivory/70">Olaya · Riyadh</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-3">
          <div className="card-luxe h-full p-8">
            <h2 className="heading-md mb-6">Send a message</h2>
            {sent ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <p className="mb-2 font-display text-2xl text-navy">Thank you.</p>
                <p className="max-w-sm text-sm text-muted">
                  Your message is with our team — expect a reply within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Field label="Name" htmlFor="ct-name" required>
                    <Input
                      id="ct-name"
                      value={form.name}
                      autoComplete="name"
                      onChange={(e) => {
                        setForm((f) => ({ ...f, name: e.target.value }));
                        setErrors((er) => ({ ...er, name: undefined }));
                      }}
                      aria-invalid={errors.name ? true : undefined}
                    />
                  </Field>
                  {errors.name && <p role="alert" className="mt-1.5 text-xs text-[#B42318]">{errors.name}</p>}
                </div>
                <div>
                  <Field label="Email" htmlFor="ct-email" required>
                    <Input
                      id="ct-email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, email: e.target.value }));
                        setErrors((er) => ({ ...er, email: undefined }));
                      }}
                      aria-invalid={errors.email ? true : undefined}
                    />
                  </Field>
                  {errors.email && <p role="alert" className="mt-1.5 text-xs text-[#B42318]">{errors.email}</p>}
                </div>
                <Field label="Phone" htmlFor="ct-phone" hint="optional">
                  <Input
                    id="ct-phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </Field>
                <Field label="Subject" htmlFor="ct-subject">
                  <Select
                    id="ct-subject"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  >
                    <option value="general">General enquiry</option>
                    <option value="order">An existing order</option>
                    <option value="corporate">Corporate & bulk gifting</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="feedback">Feedback</option>
                  </Select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Message" htmlFor="ct-message" required>
                    <Textarea
                      id="ct-message"
                      rows={5}
                      value={form.message}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, message: e.target.value }));
                        setErrors((er) => ({ ...er, message: undefined }));
                      }}
                      aria-invalid={errors.message ? true : undefined}
                    />
                  </Field>
                  {errors.message && <p role="alert" className="mt-1.5 text-xs text-[#B42318]">{errors.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="gold" size="lg">Send Message</Button>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
