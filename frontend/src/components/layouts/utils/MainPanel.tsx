import { type ReactNode, useLayoutEffect, useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import gsap from "gsap";
import Footer from "./Footer";

interface MainPanelProps {
    children: ReactNode;
}

export function MainPanel({ children }: MainPanelProps) {
    const mainRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const contentWrapperRef = useRef<HTMLDivElement>(null);
    const isFirstRender = useRef(true);
    const isInitialLoad = useRef(true);

    const router = useRouter();
    const currentPath = useRef(router.state.location.pathname);

    useLayoutEffect(() => {
        if (!mainRef.current) return;

        gsap.set(mainRef.current, {
            x: "20%",
            y: "100%",
            opacity: 0,
            scale: 0.95,
            visibility: "visible",
        });

        gsap.to(mainRef.current, {
            x: "0%",
            y: "0%",
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            onComplete: () => {
                isInitialLoad.current = false;
            },
        });
    }, []);

    useEffect(() => {
        const newPath = router.state.location.pathname;

        if (currentPath.current !== newPath && !isInitialLoad.current) {
            const depthMap: Record<string, number> = {
                "/": 0,
                "/create": 1,
                "/links": 1,
            };
            const fromDepth = depthMap[currentPath.current] ?? 1;
            const toDepth = depthMap[newPath] ?? 1;
            const isForward = toDepth > fromDepth;

            if (contentWrapperRef.current) {
                const tl = gsap.timeline();
                tl.to(contentWrapperRef.current, {
                    x: isForward ? "-20px" : "20px",
                    opacity: 0,
                    duration: 0.2,
                    ease: "power2.in",
                });
                tl.set(contentWrapperRef.current, {
                    x: isForward ? "20px" : "-20px",
                });
                tl.to(contentWrapperRef.current, {
                    x: "0px",
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out",
                });
            }
            currentPath.current = newPath;
        }
    }, [router.state.location.pathname]);

    useEffect(() => {
        if (!contentRef.current || !mainRef.current) return;

        const observer = new ResizeObserver(() => {
            if (!mainRef.current || !contentRef.current) return;

            const contentHeight = contentRef.current.scrollHeight + 180;
            const contentWidth = contentRef.current.scrollWidth + 48;
            const height = Math.min(contentHeight, window.innerHeight * 0.8);

            if (isFirstRender.current) {
                gsap.set(mainRef.current, { height, width: contentWidth });
                isFirstRender.current = false;
            } else {
                gsap.to(mainRef.current, {
                    height,
                    width: contentWidth,
                    duration: 0.45,
                    ease: "power2.inOut",
                });
            }
        });

        observer.observe(contentRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <main
            ref={mainRef}
            style={{ visibility: "hidden" }}
            className="absolute bottom-0 right-0 bg-white md:rounded-tl-[140px] rounded-tl-[100px] px-6 py-12 z-10 overflow-y-auto overflow-hidden md:w-full max-w-screen md:max-w-[900px]"
        >
            <div ref={contentRef}>
                <div ref={contentWrapperRef} className="will-change-transform overflow-hidden">
                    {children}
                </div>
            </div>

            <Footer />
        </main>
    );
}
