"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { buttonHover } from "@/lib/animations";
import { forwardRef } from "react";

type ButtonVariant = "primary" | "ghost";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-background font-semibold hover:glow-accent transition-shadow duration-200",
  ghost:
    "bg-transparent text-foreground border border-border hover:border-secondary transition-colors duration-200",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, href, onClick, ...props }, ref) => {
    const baseStyles =
      "px-6 py-3 rounded-lg text-sm font-sans tracking-wide cursor-pointer inline-flex items-center justify-center gap-2";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (href) {
        window.location.href = href;
      }
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        onClick={handleClick}
        {...buttonHover}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
