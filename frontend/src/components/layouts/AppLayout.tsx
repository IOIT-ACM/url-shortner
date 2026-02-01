import { type ReactNode } from "react";
import { MainPanel } from "./utils/MainPanel";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen w-full relative text-text bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
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
            className="h-14 md:h-16 object-contain"
          />
        </a>
      </div>

      <MainPanel>
        {children}
      </MainPanel>
    </div>
  );
}
