import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-accent text-black hover:brightness-110",
    ghost: "bg-white/5 text-text hover:bg-white/10 border border-border",
    danger: "bg-danger text-white hover:brightness-110"
  };

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

