"use client";

import clsx from "clsx";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import LoadingDots from "components/loading-dots";
import Price from "components/price";
import { DEFAULT_OPTION } from "lib/constants";
import { createUrl } from "lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Fragment, FragmentProps, Ref, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { createCartAndSetCookie, redirectToCheckout } from "./actions";
import { useCart } from "./cart-context";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";
import OpenCart from "./open-cart";
import { useCartState } from "components/layout/shrinking-layout";
import { motion } from "motion/react";

type MerchandiseSearchParams = Record<string, string>;

export default function ShrinkingCartModal(props: {
  ref?: Ref<HTMLDivElement> | undefined;
}) {
  const { cart, updateCartItem } = useCart();
  const { isCartOpen, setIsCartOpen } = useCartState();

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  useEffect(() => {
    if (!cart) {
      void createCartAndSetCookie();
    }
  }, [cart]);

  return (
    <div ref={props.ref}>
      <button
        aria-label="Open cart"
        onClick={openCart}
        className={isCartOpen ? "hidden" : "relative"}
      >
        <OpenCart quantity={cart?.totalQuantity} />
      </button>

      {/* Backdrop - only shows on mobile */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[100] transition-opacity duration-300 md:hidden"
          onClick={closeCart}
        />
      )}

      {/* Cart Sidebar - positioned to be outside the shrinking content */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isCartOpen ? 0 : "100%" }}
        transition={{ duration: 0.15 }}
        className={clsx(
          "fixed top-0 right-0 h-full w-full md:max-w-[500px] md:min-w-[300px] z-[110]",
          "dark:text-white dark:bg-neutral-900 bg-white dark:md:bg-none md:bg-none",
          isCartOpen ? "md:relative" : "",
        )}
      >
        {/* Cart Header */}
        <div className="flex items-center justify-between p-6">
          <p className="text-lg font-semibold">
            BAG [{cart?.totalQuantity ?? 0}]
          </p>
          <button
            aria-label="Close cart"
            onClick={closeCart}
            className="relative flex h-11 w-11 items-center justify-center rounded-md  text-black transition-colors dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <XMarkIcon className="h-6 transition-all ease-in-out hover:scale-110" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex h-full flex-col p-6 pb-20">
          {!cart || cart.lines.length === 0 ? (
            <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
              <ShoppingCartIcon className="h-16" />
              <p className="mt-6 text-center text-2xl font-bold">
                Your cart is empty.
              </p>
            </div>
          ) : (
            <div className="flex flex-col justify-between overflow-hidden">
              {/* Cart Items */}
              <ul className="grow overflow-auto py-4 space-y-6">
                {cart.lines
                  .sort((a, b) =>
                    a.merchandise.product.title.localeCompare(
                      b.merchandise.product.title,
                    ),
                  )
                  .map((item, i) => {
                    const merchandiseSearchParams =
                      {} as MerchandiseSearchParams;

                    item.merchandise.selectedOptions.forEach(
                      ({ name, value }) => {
                        if (value !== DEFAULT_OPTION) {
                          merchandiseSearchParams[name.toLowerCase()] = value;
                        }
                      },
                    );

                    const merchandiseUrl = createUrl(
                      `/product/${item.merchandise.product.handle}`,
                      new URLSearchParams(merchandiseSearchParams),
                    );

                    return (
                      <li key={i} className="flex gap-4  pb-4 ">
                        {/* Product Image */}
                        <div className="relative h-20 w-20 overflow-hidden rounded  bg-neutral-300  dark:bg-neutral-900 flex-shrink-0">
                          <Image
                            className="h-full w-full object-cover"
                            width={80}
                            height={80}
                            alt={
                              item.merchandise.product.featuredImage.altText ??
                              item.merchandise.product.title
                            }
                            src={item.merchandise.product.featuredImage.url}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={merchandiseUrl}
                            onClick={closeCart}
                            className="block"
                          >
                            <h3 className="font-medium hover:underline text-sm leading-tight">
                              {item.merchandise.product.title}
                            </h3>
                            {item.merchandise.title !== DEFAULT_OPTION && (
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {item.merchandise.title}
                              </p>
                            )}
                          </Link>

                          <div className="mt-2 flex items-center justify-between">
                            <Price
                              className="font-semibold text-sm"
                              amount={item.cost.totalAmount.amount}
                              currencyCode={item.cost.totalAmount.currencyCode}
                            />

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1">
                              <div className="flex items-center rounded-full">
                                <EditItemQuantityButton
                                  item={item}
                                  type="minus"
                                  optimisticUpdate={updateCartItem}
                                />
                                <span className="w-6 text-center text-xs">
                                  {item.quantity}
                                </span>
                                <EditItemQuantityButton
                                  item={item}
                                  type="plus"
                                  optimisticUpdate={updateCartItem}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <div className="flex flex-col justify-start flex-shrink-0">
                          <DeleteItemButton
                            item={item}
                            optimisticUpdate={updateCartItem}
                          />
                        </div>
                      </li>
                    );
                  })}
              </ul>

              {/* Cart Footer */}
              <div className=" pt-4  flex-shrink-0">
                <div className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center justify-between">
                    <p>Taxes</p>
                    <Price
                      className="text-right text-sm text-black dark:text-white"
                      amount={cart.cost.totalTaxAmount.amount}
                      currencyCode={cart.cost.totalTaxAmount.currencyCode}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p>Shipping</p>
                    <p className="text-right text-xs">Calculated at checkout</p>
                  </div>
                  <div className="flex items-center justify-between  pt-2 ">
                    <p className="text-base font-semibold text-black dark:text-white">
                      Total
                    </p>
                    <Price
                      className="text-right text-lg font-bold text-black dark:text-white"
                      amount={cart.cost.totalAmount.amount}
                      currencyCode={cart.cost.totalAmount.currencyCode}
                    />
                  </div>
                </div>

                <form action={redirectToCheckout} className="mt-4">
                  <CheckoutButton />
                </form>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function CheckoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="block w-full rounded-full bg-blue-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100 transition-opacity disabled:opacity-50"
      type="submit"
      disabled={pending}
    >
      {pending ? <LoadingDots className="bg-white" /> : "Proceed to Checkout"}
    </button>
  );
}
