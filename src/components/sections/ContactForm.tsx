"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MonoText, Button } from "@/components/ui";
import { MagneticButton } from "@/components/ui/MagneticButton";
import {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  staggerContainer,
  viewportOptions,
} from "@/lib/animations";

interface FormData {
  name: string;
  company: string;
  role: string;
  email: string;
  message: string;
  productInterest: string;
}

const initialForm: FormData = {
  name: "",
  company: "",
  role: "",
  email: "",
  message: "",
  productInterest: "",
};

function FormField({
  label,
  id,
  type = "text",
  value,
  onChange,
  textarea = false,
  required = false,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  required?: boolean;
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
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={id}
          rows={4}
          required={required}
          className={`${baseStyles} resize-none`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Your ${label.toLowerCase()}`}
        />
      ) : (
        <input
          id={id}
          type={type}
          required={required}
          className={baseStyles}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Your ${label.toLowerCase()}`}
        />
      )}
    </div>
  );
}

interface ContactFormProps {
  defaultProductInterest?: string;
  showIntro?: boolean;
  idPrefix?: string;
}

export function ContactForm({
  defaultProductInterest = "",
  showIntro = true,
  idPrefix = "contact",
}: ContactFormProps) {
  const [form, setForm] = useState<FormData>({
    ...initialForm,
    productInterest: defaultProductInterest,
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (field: keyof FormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      setForm({ ...initialForm, productInterest: defaultProductInterest });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOptions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {showIntro && (
          <motion.div variants={fadeInLeft} className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Talk to us
            </h2>
            <p className="mt-6 text-secondary text-lg leading-relaxed">
              Tell us about your warehouse, which products you&apos;re interested
              in, and how we can help. We&apos;ll get back to you within 24 hours.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
              <MonoText className="text-muted text-xs">
                {"> response time: 24 hours"}
              </MonoText>
            </div>
          </motion.div>
        )}

        <motion.div variants={fadeInRight} className={showIntro ? "" : "lg:col-span-2 max-w-2xl mx-auto w-full"}>
          <div className="bg-surface border border-border rounded-xl p-6 md:p-8">
            {status === "success" ? (
              <motion.div variants={fadeInUp} className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent text-xl">✓</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Message sent
                </h3>
                <p className="text-secondary text-sm">
                  Thanks for reaching out. We&apos;ll be in touch within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-sm text-accent hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Name"
                    id={`${idPrefix}-name`}
                    value={form.name}
                    onChange={updateField("name")}
                    required
                  />
                  <FormField
                    label="Company"
                    id={`${idPrefix}-company`}
                    value={form.company}
                    onChange={updateField("company")}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Role"
                    id={`${idPrefix}-role`}
                    value={form.role}
                    onChange={updateField("role")}
                  />
                  <FormField
                    label="Email"
                    id={`${idPrefix}-email`}
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    required
                  />
                </div>
                <FormField
                  label="Product interest"
                  id={`${idPrefix}-product`}
                  value={form.productInterest}
                  onChange={updateField("productInterest")}
                />
                <FormField
                  label="Message"
                  id={`${idPrefix}-message`}
                  value={form.message}
                  onChange={updateField("message")}
                  textarea
                  required
                />
                {status === "error" && (
                  <p className="text-sm text-red-400">{errorMessage}</p>
                )}
                <MagneticButton>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? "Sending..." : "Send message"}
                  </Button>
                </MagneticButton>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
