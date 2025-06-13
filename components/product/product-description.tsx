"use client";

import { AddToCart } from "components/cart/add-to-cart";
import Price from "components/price";
import Prose from "components/prose";
import { Product } from "lib/shopify/types";
import { VariantSelector } from "./variant-selector";
import { useState } from "react";

export function ProductDescription({ product }: { product: Product }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
        <div className="w-auto p-2 mt-6 text-xl flex justify-center gap-4">
          <Price
            amount={product.priceRange.maxVariantPrice.amount}
            currencyCode={product.priceRange.maxVariantPrice.currencyCode}
            className={"p-4"}
          />
          <AddToCart product={product} />
        </div>
      </div>
      <VariantSelector options={product.options} variants={product.variants} />
      {product.descriptionHtml ? (
        <>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? "max-h-none" : "max-h-24"
            }`}
          >
            <Prose
              className="text-sm leading-tight dark:text-white/[60%]"
              html={product.descriptionHtml}
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 text-sm rounded-sm p-4 text-blue-600 hover:opacity-90 dark:text-white dark:bg-blue-600 transition-colors"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        </>
      ) : null}
    </>
  );
}
