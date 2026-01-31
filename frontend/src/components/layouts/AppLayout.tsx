import { type ReactNode, useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { Github, Instagram, Linkedin, Globe, Eye } from "lucide-react"

interface AppLayoutProps {
	children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
	const mainRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const isFirstRender = useRef(true)
	const [isVisible, setIsVisible] = useState(true)

	useEffect(() => {
		if (!contentRef.current || !mainRef.current) return

		const observer = new ResizeObserver(() => {
			if (!mainRef.current || !contentRef.current || !isVisible) return

			const contentHeight = contentRef.current.scrollHeight + 140
			const contentWidth = contentRef.current.scrollWidth + 48
			const height = Math.min(contentHeight, window.innerHeight * 0.8)

			if (isFirstRender.current) {
				gsap.set(mainRef.current, { height, width: contentWidth })
				isFirstRender.current = false
			} else {
				gsap.to(mainRef.current, {
					height,
					width: contentWidth,
					duration: 0.45,
					ease: "power2.inOut"
				})
			}
		})

		observer.observe(contentRef.current)
		return () => observer.disconnect()
	}, [isVisible])

	useEffect(() => {
		if (!mainRef.current) return

		if (isVisible) {
			gsap.to(mainRef.current, {
				y: 0,
				ease: "power1.out",
				pointerEvents: "auto"
			})
		} else {
			gsap.to(mainRef.current, {
				y: "100%",
				ease: "power1.in",
				pointerEvents: "none"
			})
		}
	}, [isVisible])

	return (
		<div className="min-h-screen w-full relative text-text bg-black overflow-hidden">
			<div
				className="absolute inset-0 z-0 cursor-pointer"
				onClick={() => setIsVisible(false)}
			>
				<img
					src="/bg.jpeg"
					alt="Background"
					className="w-full h-full object-cover object-center opacity-40 grayscale"
				/>
				<div className="absolute inset-0 bg-gradient-to-tr from-black via-black/20 to-transparent" />
			</div>

			<div className="absolute top-6 right-6 z-20">
				<a
					href="https://ioit.acm.org/"
					target="_blank"
					rel="noreferrer"
					className="opacity-80 hover:opacity-100 transition-opacity"
				>
					<img
						src="https://ioit.acm.org/static/mediakit/acm-logo-light.png"
						alt="ACM Logo"
						className="h-8 md:h-10 object-contain"
					/>
				</a>
			</div>


			{!isVisible && (
				<button
					onClick={(e) => {
						e.stopPropagation()
						setIsVisible(true)
					}}
					className="absolute bottom-32 right-10 z-30 bg-white text-black px-8 py-4 rounded-full font-bold shadow-2xl active:scale-95 transition-transform flex items-center gap-2 cursor-pointer"
				>
					<Eye size={20} />
					Panel
				</button>
			)}

			<main
				ref={mainRef}
				className="absolute bottom-0 right-0 bg-white md:rounded-tl-[140px] rounded-tl-[100px] px-6 py-12 z-10 overflow-y-auto md:w-full max-w-screen md:max-w-[900px]"
			>
				<div ref={contentRef}>
					{children}
				</div>

				<footer className="flex items-center justify-center gap-8 text-black/30">
					<a href="https://github.com/ioit-acm" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors p-2">
						<Github size={20} />
					</a>
					<a href="https://instagram.com/ioit__acm" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors p-2">
						<Instagram size={20} />
					</a>
					<a href="https://linkedin.com/company/ioit-acm" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors p-2">
						<Linkedin size={20} />
					</a>
					<a href="https://ioit.acm.org" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors p-2">
						<Globe size={20} />
					</a>
				</footer>
			</main>
		</div>
	)
}