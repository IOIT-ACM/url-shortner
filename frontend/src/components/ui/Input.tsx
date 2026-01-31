import {
	forwardRef,
	useRef,
	useEffect,
	useImperativeHandle,
	type InputHTMLAttributes,
	type ReactNode,
} from "react";
import gsap from "gsap";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
	suffix?: ReactNode;
	shake?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
	{
		className = "",
		error = false,
		disabled = false,
		suffix,
		shake = false,
		...props
	},
	ref
) {
	const inputRef = useRef<HTMLInputElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);

	useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

	useEffect(() => {
		if (shake && wrapperRef.current) {
			gsap.to(wrapperRef.current, {
				keyframes: [
					{ x: -4, duration: 0.05 },
					{ x: 4, duration: 0.05 },
					{ x: -4, duration: 0.05 },
					{ x: 4, duration: 0.05 },
					{ x: 0, duration: 0.05 },
				],
				ease: "power2.out",
			});
		}
	}, [shake]);

	const baseContainerClasses =
		"relative w-full";

	const baseInputClasses =
		"h-11 w-full rounded-md bg-black/5 border border-black/10 px-4 font-sans text-sm text-black outline-none transition-all placeholder:text-black/40 focus:bg-white focus:border-black";

	const stateClasses = error
		? "border-error"
		: disabled
			? "bg-black/10 text-black/40 cursor-not-allowed"
			: "hover:border-black/30";

	return (
		<div ref={wrapperRef} className={baseContainerClasses}>
			<input
				ref={inputRef}
				className={`${baseInputClasses} ${stateClasses} ${suffix ? "pr-12" : ""} ${className}`}
				disabled={disabled}
				{...props}
			/>
			{suffix && (
				<div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none text-black/40">
					{suffix}
				</div>
			)}
		</div>
	);
});
