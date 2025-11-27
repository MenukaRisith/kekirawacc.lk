// app/routes/admin.alumni._index.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { pool } from "~/utils/db.server";
import {
  requireUserWithRole,
  type AuthUser,
} from "~/utils/auth.server";
import { AdminLayout } from "~/components/admin/AdminLayout";

export const meta: MetaFunction = () => [
  { title: "Manage Alumni – Kekirawa Central College" },
];

type AlumniRow = {
  id: number;
  name: string;
  slug: string;
  gradYear: number | null;
  headline: string | null;
  isFeatured: 0 | 1;
  createdAt: string;
};

type LoaderData = {
  user: AuthUser;
  alumni: AlumniRow[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserWithRole(request, ["ADMIN"]);

  const [rows] = await pool.query(
    `
      SELECT id, name, slug, gradYear, headline, isFeatured, createdAt
      FROM Alumni
      ORDER BY isFeatured DESC, gradYear DESC, name ASC
    `
  );

  const alumni = rows as AlumniRow[];
  return json<LoaderData>({ user, alumni });
};

export default function AdminAlumniIndexPage() {
  const { user, alumni } = useLoaderData<LoaderData>();

  return (
    <AdminLayout user={user} title="Notable alumni">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Alumni profiles
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage notable alumni shown on the alumni page.
          </p>
        </div>
        <Link
          to="/admin/alumni/new"
          className="inline-flex items-center rounded-full bg-[#800000] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#650000] transition"
        >
          + New alumni profile
        </Link>
      </div>

      {alumni.length === 0 ? (
        <p className="text-sm text-gray-600">
          No alumni profiles yet. Create your first profile.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Year
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Headline
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Featured
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {alumni.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {a.name}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        slug: {a.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-[11px] text-gray-600">
                    {a.gradYear || "—"}
                  </td>
                  <td className="px-4 py-2 align-top text-[11px] text-gray-600">
                    {a.headline || "—"}
                  </td>
                  <td className="px-4 py-2 align-top text-[11px]">
                    {a.isFeatured ? (
                      <span className="inline-flex items-center rounded-full bg-yellow-50 border border-yellow-200 px-2 py-0.5 text-[11px] text-yellow-800">
                        Featured
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[11px] text-gray-700">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 align-top text-[11px]">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/alumni/${a.id}/edit`}
                        className="text-[#800000] hover:underline"
                      >
                        Edit
                      </Link>
                      {/* You can later link to /alumni section anchor if you use slug anchors */}
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
