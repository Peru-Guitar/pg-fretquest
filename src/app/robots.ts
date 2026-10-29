import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/routes";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

/** Se indexa todo salvo las páginas personales y las de admin. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: [ROUTES.plan, ROUTES.account, ROUTES.community, ROUTES.login, ROUTES.soundCheck] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
