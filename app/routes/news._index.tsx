// app/routes/news._index.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { pool } from "~/utils/db.server";

export const meta: MetaFunction = () => [
  { title: "News & Announcements – Kekirawa Central College" },
  {
    name: "description",
    content:
      "Latest news, announcements and achievements from Kekirawa Central College – term notices, competitions, club updates and more.",
  },
];

type NewsListRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string;
  clubName: string | null;
};

type LoaderData = {
  items: NewsListRow[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  club: string;
};

const PAGE_SIZE = 9;

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const q = (url.searchParams.get("q") || "").trim();
  const club = (url.searchParams.get("club") || "").trim();

  const filters: string[] = [`status = 'PUBLISHED'`, `publishedAt IS NOT NULL`];
  const params: (string | number)[] = [];

  if (q) {
    filters.push(`(title LIKE ? OR excerpt LIKE ? OR content LIKE ?)`);
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  if (club) {
    filters.push(`c.slug = ?`);
    params.push(club);
  }

  const whereSql = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  // Count
  const [countRowsRaw] = await pool.query(
    `
      SELECT COUNT(*) AS count
      FROM NewsPost n
      LEFT JOIN Club c ON n.clubId = c.id
      ${whereSql}
    `,
    params
  );
  const countRows = countRowsRaw as { count: number }[];
  const total = countRows[0]?.count ?? 0;

  const offset = (page - 1) * PAGE_SIZE;

  const [rowsRaw] = await pool.query(
    `
      SELECT
        n.id,
        n.title,
        n.slug,
        n.excerpt,
        n.coverImage,
        n.publishedAt,
        c.name AS clubName
      FROM NewsPost n
      LEFT JOIN Club c ON n.clubId = c.id
      ${whereSql}
      ORDER BY n.publishedAt DESC
      LIMIT ? OFFSET ?
    `,
    [...params, PAGE_SIZE, offset]
  );
  const rows = rowsRaw as NewsListRow[];

  return json<LoaderData>({
    items: rows,
    total,
    page,
    pageSize: PAGE_SIZE,
    q,
    club,
  });
};

export default function NewsIndexPage() {
  const data = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#800000] mb-2">
            News & Announcements
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            Latest from Kekirawa Central College
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl">
            Updates from the Principal, notices for parents, club achievements
            and important term announcements.
          </p>

          {/* Simple search bar */}
          <form
            method="get"
            className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center"
          >
            <input
              type="text"
              name="q"
              defaultValue={data.q}
              placeholder="Search news…"
              className="w-full sm:max-w-md rounded-full border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-[#800000] focus:ring-[#800000]"
            />
            {/* Keep page reset */}
            <input type="hidden" name="page" value="1" />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[#800000] px-5 py-2 text-xs font-semibold text-white hover:bg-[#650000] shadow-sm transition"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        {data.items.length === 0 ? (
          <p className="text-sm text-gray-600">
            No news found{data.q ? ` for “${data.q}”` : ""}. Please try a
            different search or check back later.
          </p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {data.items.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  {post.coverImage && (
                    <div className="aspect-[4/3] bg-gray-100">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4 flex flex-col">
                    <p className="text-[11px] text-gray-500 mb-1">
                      {formatDate(post.publishedAt)}
                      {post.clubName && (
                        <>
                          {" · "}
                          <span className="font-medium text-gray-700">
                            {post.clubName}
                          </span>
                        </>
                      )}
                    </p>
                    <h2 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-xs text-gray-600 line-clamp-3 mb-3">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="mt-auto">
                      <Link
                        to={`/news/${post.slug}`}
                        className="inline-flex items-center text-[11px] font-semibold text-[#800000] hover:underline"
                      >
                        Read full story →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2 text-xs">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;
                  const isActive = page === data.page;
                  const params = new URLSearchParams(searchParams);
                  params.set("page", String(page));
                  return (
                    <Link
                      key={page}
                      to={`?${params.toString()}`}
                      className={`min-w-[32px] rounded-full border px-3 py-1 text-center ${
                        isActive
                          ? "border-[#800000] bg-[#800000] text-white"
                          : "border-gray-200 bg-white text-gray-800 hover:border-[#800000]/60"
                      }`}
                    >
                      {page}
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

/* === helpers === */

function formatDate(value: string): string {
  const d = new Date(value);
  return d.toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
