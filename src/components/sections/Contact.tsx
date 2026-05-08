"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MonoText, Button } from "@/components/ui";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, viewportOptions } from "@/lib/animations";

interface FormData {
  name: string;
  company: string;
  role: string;
  email: string;
  message: string;
}

const initialForm: FormData = {
  name: "",
  company: "",
  role: "",
  email: "",
  message: "",
};

function FormField({
  label,
  id,
  type = "text",
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const baseStyles =
    "w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors duration-200";

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-mono text-muted uppercase tracking-wider mb-2"
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          rows={4}
          className={`${baseStyles} resize-none`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Your ${label.toLowerCase()}`}
        />
      ) : (
        <input
          id={id}
          type={type}
          className={baseStyles}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Your ${label.toLowerCase()}`}
        />
      )}
    </div>
  );
}

export function Contact() {
  const [form, setForm] = useState<FormData>(initialForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent(
      `TAIR website inquiry from ${form.name}`
    );
    const body = encodeURIComponent(
      `Name: ${form.name}\nCompany: ${form.company}\nRole: ${form.role}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );

    window.location.href = `mailto:321tair@gmail.com?subject=${subject}&body=${body}`;
  };

  const updateField = (field: keyof FormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-32 px-6">
      <motion.div
        className="max-w-5xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: copy */}
          <motion.div variants={fadeInLeft} className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Talk to us
            </h2>
            <p className="mt-6 text-secondary text-lg leading-relaxed">
              If you run a 3PL, operate cold chain logistics, or invest in
              vertical AI, we want to hear from you.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
              <MonoText className="text-muted text-xs">
                {"> response time: 24 hours"}
              </MonoText>
            </div>
          </motion.div>

          {/* Right: form wrapped in card */}
          <motion.div variants={fadeInRight}>
            <div className="bg-surface border border-border rounded-xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Name"
                    id="contact-name"
                    value={form.name}
                    onChange={updateField("name")}
                  />
                  <FormField
                    label="Company"
                    id="contact-company"
                    value={form.company}
                    onChange={updateField("company")}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Role"
                    id="contact-role"
                    value={form.role}
                    onChange={updateField("role")}
                  />
                  <FormField
                    label="Email"
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                  />
                </div>
                <FormField
                  label="Message"
                  id="contact-message"
                  value={form.message}
                  onChange={updateField("message")}
                  textarea
                />
                <MagneticButton>
                  <Button type="submit" className="w-full sm:w-auto">
                    Send message
                  </Button>
                </MagneticButton>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
