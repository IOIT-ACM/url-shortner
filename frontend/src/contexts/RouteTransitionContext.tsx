import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface RouteTransitionContextType {
  isTransitioning: boolean;
  startTransition: () => Promise<void>;
  completeTransition: () => void;
}

const RouteTransitionContext = createContext<RouteTransitionContextType | null>(
  null,
);

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = useCallback(() => {
    return new Promise<void>((resolve) => {
      setIsTransitioning(true);
      setTimeout(resolve, 400);
    });
  }, []);

  const completeTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  return (
    <RouteTransitionContext.Provider
      value={{ isTransitioning, startTransition, completeTransition }}
    >
      {children}
    </RouteTransitionContext.Provider>
  );
}

export const useRouteTransition = () => {
  const context = useContext(RouteTransitionContext);
  if (!context)
    throw new Error(
      "useRouteTransition must be used within RouteTransitionProvider",
    );
  return context;
};
