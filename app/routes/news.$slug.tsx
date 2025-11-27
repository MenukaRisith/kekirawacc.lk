// app/routes/news.$slug.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { pool } from "~/utils/db.server";

type NewsDetailRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string; // React Quill HTML
  coverImage: string | null;
  publishedAt: string;
  clubName: string | null;
  metaKeywords: string | null; // 👈 SEO tags from DB
};

type LoaderData = {
  post: NewsDetailRow;
};

export const loader: LoaderFunction = async ({ params }) => {
  const slug = (params.slug || "").toString().trim();
  if (!slug) throw redirect("/news");

  const [rowsRaw] = await pool.query(
    `
      SELECT
        n.id,
        n.title,
        n.slug,
        n.excerpt,
        n.content,
        n.coverImage,
        n.publishedAt,
        n.metaKeywords,
        c.name AS clubName
      FROM NewsPost n
      LEFT JOIN Club c ON n.clubId = c.id
      WHERE n.slug = ?
        AND n.status = 'PUBLISHED'
        AND n.publishedAt IS NOT NULL
      LIMIT 1
    `,
    [slug]
  );
  const rows = rowsRaw as NewsDetailRow[];

  if (!rows || rows.length === 0) {
    throw redirect("/news");
  }

  return json<LoaderData>({ post: rows[0] });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "News – Kekirawa Central College" },
      {
        name: "description",
        content: "News and announcements from Kekirawa Central College.",
      },
    ];
  }

  const { post } = data;

  const tags: ReturnType<MetaFunction> = [
    { title: `${post.title} – Kekirawa Central College` },
    {
      name: "description",
      content: post.excerpt || "Latest update from Kekirawa Central College.",
    },
  ];

  // Add <meta name="keywords"> only if provided
  if (post.metaKeywords && post.metaKeywords.trim().length > 0) {
    tags.push({
      name: "keywords",
      content: post.metaKeywords,
    });
  }

  return tags;
};

export default function NewsSlugPage() {
  const { post } = useLoaderData<LoaderData>();

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      <article className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        {/* Back link */}
        <div className="mb-4">
          <Link
            to="/news"
            className="inline-flex items-center text-xs font-semibold text-[#800000] hover:underline"
          >
            ← Back to news
          </Link>
        </div>

        {/* Meta */}
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#800000] mb-2">
          News &amp; Announcements
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600 mb-6">
          <span>{formatDate(post.publishedAt)}</span>
          {post.clubName && (
            <>
              <span className="mx-1">•</span>
              <span className="font-medium text-gray-700">
                {post.clubName}
              </span>
            </>
          )}
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <div className="mb-6 rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-gray-700 mb-6 italic">
            {post.excerpt}
          </p>
        )}

        {/* Content – HTML from React Quill */}
        <div
          // `ql-editor` helps if you also load React Quill's CSS globally
          className="
            ql-editor
            prose prose-sm md:prose-base max-w-none
            prose-headings:text-gray-900
            prose-p:text-gray-800
            prose-a:text-[#800000] hover:prose-a:text-[#650000]
            prose-ul:list-disc prose-ol:list-decimal
            prose-ul:pl-5 prose-ol:pl-5
            prose-li:my-1
            prose-img:rounded-xl prose-img:my-4 prose-img:max-w-full prose-img:h-auto
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Bottom link */}
        <div className="mt-10 border-t border-gray-200 pt-4">
          <Link
            to="/news"
            className="inline-flex items-center text-xs font-semibold text-[#800000] hover:underline"
          >
            ← View all news &amp; announcements
          </Link>
        </div>
      </article>
    </div>
  );
}

/* === helper === */

function formatDate(value: string): string {
  const d = new Date(value);
  return d.toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
