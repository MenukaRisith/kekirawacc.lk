// app/routes/admin.clubs._index.tsx
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
  { title: "Manage Clubs – Kekirawa Central College" },
];

type ClubListRow = {
  id: number;
  name: string;
  slug: string;
  shortName: string | null;
  category: string | null;
  createdAt: string;
};

type LoaderData = {
  user: AuthUser;
  clubs: ClubListRow[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserWithRole(request, ["ADMIN"]);

  const [rows] = await pool.query(
    `
      SELECT id, name, slug, shortName, category, createdAt
      FROM Club
      ORDER BY name ASC
    `
  );

  const clubs = rows as ClubListRow[];

  return json<LoaderData>({ user, clubs });
};

export default function AdminClubsIndexPage() {
  const { user, clubs } = useLoaderData<LoaderData>();

  return (
    <AdminLayout user={user} title="Clubs & societies">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Clubs & societies
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage official clubs, societies and associations of the college.
          </p>
        </div>
        <Link
          to="/admin/clubs/new"
          className="inline-flex items-center rounded-full bg-[#800000] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#650000] transition"
        >
          + New club
        </Link>
      </div>

      {clubs.length === 0 ? (
        <p className="text-sm text-gray-600">
          No clubs registered yet. Create your first club profile.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Club
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Created
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club) => (
                <tr
                  key={club.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {club.name}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {club.shortName ?? ""} /clubs/{club.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-[11px] text-gray-600">
                    {club.category || "—"}
                  </td>
                  <td className="px-4 py-2 align-top text-[11px] text-gray-600">
                    {formatDate(club.createdAt)}
                  </td>
                  <td className="px-4 py-2 align-top text-[11px]">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/clubs/${club.id}/edit`}
                        className="text-[#800000] hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/clubs/${club.slug}`}
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

/* === Helper === */

function formatDate(value: string): string {
  const d = new Date(value);
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
