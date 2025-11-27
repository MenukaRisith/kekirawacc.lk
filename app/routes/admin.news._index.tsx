
// app/routes/admin.news._index.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { RowDataPacket } from "mysql2";
import { pool } from "~/utils/db.server";
import {
  requireUserWithRole,
  type AuthUser,
} from "~/utils/auth.server";
import { AdminLayout } from "~/components/admin/AdminLayout";

export const meta: MetaFunction = () => [
  { title: "Manage News – Kekirawa Central College" },
];

interface NewsListRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
}

type LoaderData = {
  user: AuthUser;
  posts: NewsListRow[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserWithRole(request, [
    "ADMIN",
    "AUTHOR",
    "CLUB_REP",
  ]);

  let query = `
    SELECT id, title, slug, status, publishedAt, createdAt
    FROM NewsPost
  `;

  // values we pass to the SQL query – here it's just user.id (number or string)
  const params: Array<string | number> = [];

  if (user.role === "ADMIN") {
    query += ` ORDER BY createdAt DESC LIMIT 100`;
  } else {
    query += ` WHERE authorId = ? ORDER BY createdAt DESC LIMIT 100`;
    params.push(user.id);
  }

  // Tell mysql2 what type rows should be
  const [rows] = await pool.query<NewsListRow[]>(query, params);

  return json<LoaderData>({ user, posts: rows });
};

export default function AdminNewsIndexPage() {
  const { user, posts } = useLoaderData<LoaderData>();

  return (
    <AdminLayout user={user} title="News">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            News posts
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Create and manage news items shown on the main website.
          </p>
        </div>
        <Link
          to="/admin/news/new"
          className="inline-flex items-center rounded-full bg-[#800000] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#650000] transition"
        >
          + New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-gray-600">
          No news posts yet. Start by creating your first post.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Title
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Published
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {post.title}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        /news/{post.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-2 align-top text-[11px] text-gray-600">
                    {post.publishedAt
                      ? formatDateTime(post.publishedAt)
                      : "—"}
                  </td>
                  <td className="px-4 py-2 align-top text-[11px]">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/news/${post.id}/edit`}
                        className="text-[#800000] hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/news/${post.slug}`}
                        className="text-gray-500 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

/* === Local helpers === */

function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  const isPublished = status === "PUBLISHED";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        isPublished
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-gray-100 text-gray-700 border border-gray-200",
      ].join(" ")}
    >
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

function formatDateTime(value: string): string {
  const d = new Date(value);
  return d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
