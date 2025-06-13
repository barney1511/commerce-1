import { getMenu } from "lib/shopify";
import { NavbarClient } from "@/components/layout/navbar/nav-client";

const { SITE_NAME } = process.env;

export async function Navbar() {
  const menu = await getMenu("next-js-frontend-header-menu");

  return <NavbarClient menu={menu} siteName={SITE_NAME ?? ""} />;
}
