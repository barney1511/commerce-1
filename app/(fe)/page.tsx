import { Carousel } from "components/carousel";
import { ThreeItemGrid } from "components/grid/three-items";
import Footer from "components/layout/footer";
import GalleryHero from "@/components/3js/3d-hero-section";
import { getCollectionProducts } from "@/lib/shopify";

export const metadata = {
  description:
    "High-performance ecommerce store built with Next.js, Vercel, and Shopify.",
  openGraph: {
    type: "website",
  },
};

export default async function HomePage() {
  const homepageItems = await getCollectionProducts({
    collection: "hidden-homepage-featured-items",
  });
  return (
    <>
      <GalleryHero homepageItems={homepageItems} />
      {/*<ThreeItemGrid homepageItems={homepageItems} />*/}
      <Carousel />
      <Footer />
    </>
  );
}
