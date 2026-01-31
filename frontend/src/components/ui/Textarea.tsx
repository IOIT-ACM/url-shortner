import {
	forwardRef,
	useRef,
	useEffect,
	useImperativeHandle,
	type TextareaHTMLAttributes,
} from "react";
import gsap from "gsap";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	error?: boolean;
	shake?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	function Textarea(
		{
			className = "",
			error = false,
			disabled = false,
			shake = false,
			...props
		},
		ref,
	) {
		const textareaRef = useRef<HTMLTextAreaElement>(null);
		const wrapperRef = useRef<HTMLDivElement>(null);

		useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

		// GSAP shake animation
		useEffect(() => {
			if (shake && wrapperRef.current) {
				gsap.to(wrapperRef.current, {
					keyframes: [
						{ x: -4, duration: 0.05 },
						{ x: 4, duration: 0.05 },
						{ x: -4, duration: 0.05 },
						{ x: 4, duration: 0.05 },
						{ x: -2, duration: 0.05 },
						{ x: 2, duration: 0.05 },
						{ x: 0, duration: 0.05 },
					],
					ease: "power2.out",
				});
			}
		}, [shake]);

		const baseClasses =
			"min-h-[80px] w-full  border px-5 py-3 font-['Figtree',sans-serif] font-medium text-sm outline-none transition-all duration-200 ease-out resize-none";

		const stateClasses = error
			? "border-[#a22121] shadow-[0px_1px_0px_0px_#a22121] text-[#8d2727] placeholder:text-[#8d2727] bg-white"
			: disabled
				? "bg-[#c5c5c5] border-[rgba(64,64,64,0.31)] shadow-[0px_1px_0px_0px_rgba(114,114,114,0.24)] text-[#898989] placeholder:text-[#898989]"
				: "bg-white border-[rgba(64,64,64,0.31)] shadow-[0px_1px_0px_0px_rgba(114,114,114,0.24)] text-[#717171] placeholder:text-[#717171] focus:border-[#738f17] focus:shadow-[0px_1px_0px_0px_#738f17,0px_0px_0px_3px_rgba(203,255,31,0.15)]";

		return (
			<div ref={wrapperRef} className="w-full">
				<textarea
					ref={textareaRef}
					className={`${baseClasses} ${stateClasses} ${className}`}
					disabled={disabled}
					{...props}
				/>
			</div>
		);
	},
);
