import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

/** Se indexa todo salvo las páginas personales y la sala de práctica. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/plan", "/account", "/community", "/login", "/practice"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
