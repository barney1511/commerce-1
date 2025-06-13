"use client";

import { useCart } from "components/cart/cart-context";
import {
  createContext,
  MouseEventHandler,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ShrinkingCartModal from "@/components/cart/modal";
import { motion } from "motion/react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

// Create a context to share cart state between layout and modal
const CartStateContext = createContext<{
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}>({
  isCartOpen: false,
  setIsCartOpen: () => {},
});

export const useCartState = () => useContext(CartStateContext);

interface ShrinkingLayoutProps {
  children: ReactNode;
}

export const ShrinkingComponent = motion.create(ShrinkingCartModal);

export default function ShrinkingLayout({ children }: ShrinkingLayoutProps) {
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const quantityRef = useRef(cart?.totalQuantity);
  const isMobile = useIsMobile();

  const handleCartClose = (e: React.MouseEvent) => {
    if (isCartOpen) {
      setIsCartOpen(false);
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Auto-open cart when items are added
  useEffect(() => {
    if (
      cart?.totalQuantity &&
      cart?.totalQuantity !== quantityRef.current &&
      cart?.totalQuantity > 0
    ) {
      setIsCartOpen(true);
      quantityRef.current = cart?.totalQuantity;
    }
  }, [cart?.totalQuantity]);

  const childrenArray = Array.isArray(children) ? children : [children];
  const navbar = childrenArray[0]; // First child is Navbar
  const mainContent = childrenArray[1]; // Second child is main content

  return (
    <CartStateContext.Provider value={{ isCartOpen, setIsCartOpen }}>
      <>
        <div
          className={`${isCartOpen ? "w-svw top-0" : "max-w-(--breakpoint-2xl) mx-auto"} relative z-30`}
        >
          {navbar}
        </div>
        <div
          className={`${isCartOpen ? "md:flex md:h-[70vh] md:justify-between" : ""}`}
        >
          <motion.div
            layout
            transition={{ duration: 0.25 }}
            className={`
            ${
              isCartOpen
                ? "md:overflow-hidden"
                : "md:max-w-(--breakpoint-2xl) md:mx-auto"
            }
          `}
            onClick={handleCartClose}
          >
            {mainContent}
          </motion.div>
          {isCartOpen && (
            <ShrinkingComponent
              initial={{ x: isMobile ? 0 : 500 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
            />
          )}
        </div>
        <CartModalPortal />

        {isCartOpen && (
          <style jsx global>{`
            @media (min-width: 768px) {
              body {
                overflow: hidden;
              }
            }
          `}</style>
        )}
      </>
    </CartStateContext.Provider>
  );
}

function CartModalPortal() {
  return <></>;
}
