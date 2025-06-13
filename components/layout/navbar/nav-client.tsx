"use client";

import LogoSquare from "components/logo-square";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import Search, { SearchSkeleton } from "./search";
import {
  ShrinkingComponent,
  useCartState,
} from "components/layout/shrinking-layout";
import { motion } from "motion/react";

export function NavbarClient({
  menu,
  siteName,
}: {
  menu: Menu[];
  siteName: string;
}) {
  const { isCartOpen, setIsCartOpen } = useCartState();
  const closeCart = () => setIsCartOpen(false);

  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} />
        </Suspense>
      </div>
      <div className="flex w-full items-center">
        <div className={`flex w-full md:w-1/3`}>
          <Link
            href="/"
            onClick={closeCart}
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <LogoSquare />
            <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block">
              {siteName}
            </div>
          </Link>
          {menu.length ? (
            <ul
              className={`hidden gap-6 text-sm md:flex md:items-center transition-opacity duration-300`}
            >
              {menu.map((item: Menu) => (
                <li key={item.title}>
                  <Link
                    onClick={closeCart}
                    href={item.path}
                    prefetch={true}
                    className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <motion.div
          animate={{ opacity: isCartOpen ? 0 : 1, y: isCartOpen ? -30 : 0 }}
          className={`hidden justify-center md:flex md:w-1/3`}
        >
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </motion.div>

        <div className={`flex justify-end md:w-1/3`}>
          {!isCartOpen && <ShrinkingComponent />}
        </div>
      </div>
    </nav>
  );
}
