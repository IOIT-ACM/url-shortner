import { forwardRef, type InputHTMLAttributes, useId } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	function Checkbox({ label, className = "", ...props }, ref) {
		const id = useId();
		return (
			<label htmlFor={id} className="flex items-center gap-3 cursor-pointer group">
				<div className="relative flex items-center">
					<input
						ref={ref}
						id={id}
						type="checkbox"
						className={`peer h-5 w-5 appearance-none border border-border bg-surface transition-all checked:border-accent checked:bg-accent hover:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30 ${className}`}
						{...props}
					/>
					<svg
						className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
					>
						<path
							d="M10 3L4.5 8.5L2 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
				{label && (
					<span className="text-sm font-medium text-text-sub group-hover:text-text transition-colors">
						{label}
					</span>
				)}
			</label>
		);
	},
);
