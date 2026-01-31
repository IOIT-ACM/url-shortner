import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost" | "danger";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
	children: ReactNode;
}

export function Button({
	variant = "primary",
	size = "md",
	isLoading = false,
	disabled = false,
	children,
	className = "",
	...props
}: ButtonProps) {
	const baseClasses =
		"rounded-md font-bold transition-colors duration-150 flex items-center justify-center disabled:opacity-70 focus:outline-none cursor-pointer";

	const sizeClasses = {
		sm: "h-10 px-4 text-xs",
		md: "h-12 px-6 text-sm",
		lg: "h-14 px-8 text-base",
	};

	const variantClasses = {
		primary: "bg-accent text-white hover:bg-accent-alt",
		secondary:
			"bg-surface text-text border border-border hover:bg-surface-muted hover:border-text-sub/30 shadow-sm",
		ghost:
			"bg-transparent text-accent hover:bg-accent/10 border border-transparent",
		danger:
			"bg-error/10 text-error border border-error/20 hover:bg-error/20",
	};

	return (
		<button
			className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading ? (
				<Spinner className={variant === "primary" ? "text-white" : "text-current"} />
			) : (
				children
			)}
		</button>
	);
}
