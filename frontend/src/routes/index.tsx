import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export const Route = createFileRoute("/")({
  component: Index,
});

function ActionLink({
  to,
  label,
  className,
}: {
  to: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`relative w-full max-w-xs mx-auto group ${className}`}>
      <span className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-accent group-hover:w-full group-hover:h-full transition-all duration-300" />
      <span className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-accent group-hover:w-full group-hover:h-full transition-all duration-300" />
      <Link
        to={to}
        className="block w-full text-center px-6 md:px-10 py-3 md:py-5 text-sm font-bold tracking-[0.2em] uppercase text-black group-hover:text-accent transition-colors relative z-10"
      >
        {label}
      </Link>
    </div>
  );
}

function Index() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".animate-in");
      gsap.fromTo(
        elements,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.1,
        },
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full flex items-center justify-center px-6 pb-10"
    >
      <div className="w-full max-w-xl text-center">
        <div className="md:mb-16 mb-10 animate-in">
          <h1 className="text-2xl md:text-5xl font-black tracking-tighter mb-6 text-black">
            Links <span className="text-accent">by IOIT ACM.</span>
          </h1>
          <p className="text-black/50 md:text-lg text-sm leading-relaxed mx-auto font-medium">
            URL Shortner for creating clean, shareable links and manage them effortlessly.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <ActionLink to="/create" label="Create Link" className="animate-in" />
          <ActionLink
            to="/links"
            label="View All Links"
            className="animate-in"
          />
        </div>
      </div>
    </div>
  );
}
