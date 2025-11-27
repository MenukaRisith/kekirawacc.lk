// app/routes/sitemap[.]xml.ts
import type { LoaderFunctionArgs } from "@remix-run/node";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "~/utils/db.server";

type NewsRow = RowDataPacket & {
  slug: string;
  updatedAt: Date | null;
};

type EventRow = RowDataPacket & {
  slug: string;
  updatedAt: Date | null;
  startDate: Date | null;
};

type ClubRow = RowDataPacket & {
  slug: string;
  updatedAt: Date | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Build base URL from the incoming request
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`; // e.g. https://kekirawacc.lk

  // --- Fetch dynamic URLs from DB ---

  // News posts (published only)
  const [newsRows] = await pool.query<NewsRow[]>(
    `
      SELECT slug, updatedAt
      FROM NewsPost
      WHERE status = 'PUBLISHED'
        AND publishedAt IS NOT NULL
      ORDER BY publishedAt DESC
    `
  );

  // Events (published only)
  const [eventRows] = await pool.query<EventRow[]>(
    `
      SELECT slug, updatedAt, startDate
      FROM Event
      WHERE status = 'PUBLISHED'
      ORDER BY startDate DESC
    `
  );

  // Clubs (for /clubs/:slug pages)
  const [clubRows] = await pool.query<ClubRow[]>(
    `
      SELECT slug, updatedAt
      FROM club
      ORDER BY name ASC
    `
  );

  // --- Static pages ---

  const staticPaths: string[] = [
    "", // home
    "about",
    "academics",
    "life-at-kcc",
    "clubs",
    "sports",
    "alumni",
    "staff",
    "administration",
    "contact",
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Static URLs
  for (const path of staticPaths) {
    const loc =
      path === "" ? `${baseUrl}/` : `${baseUrl}/${encodeURI(path)}`;
    xml += `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  // News URLs
  for (const post of newsRows) {
    const lastmod = (post.updatedAt ?? new Date()).toISOString();
    xml += `  <url>
    <loc>${baseUrl}/news/${encodeURIComponent(post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;
  }

  // Event URLs
  for (const ev of eventRows) {
    const lastmod = (
      ev.updatedAt ??
      ev.startDate ??
      new Date()
    ).toISOString();
    xml += `  <url>
    <loc>${baseUrl}/events/${encodeURIComponent(ev.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;
  }

  // Club URLs (/clubs/:slug)
  for (const club of clubRows) {
    const lastmod = (club.updatedAt ?? new Date()).toISOString();
    xml += `  <url>
    <loc>${baseUrl}/clubs/${encodeURIComponent(club.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  xml += `</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600", // 1 hour
    },
  });
}
