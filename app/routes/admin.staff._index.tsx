// app/routes/admin.staff._index.tsx
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
  { title: "Manage Staff – Kekirawa Central College" },
];

type StaffRow = {
  id: number;
  name: string;
  roleTitle: string;
  department: string | null;
  isInAdminPage: 0 | 1;
  sortOrder: number;
};

type LoaderData = {
  user: AuthUser;
  staff: StaffRow[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserWithRole(request, ["ADMIN"]);

  const [rows] = await pool.query(
    `
      SELECT id, name, roleTitle, department, isInAdminPage, sortOrder
      FROM StaffMember
      ORDER BY isInAdminPage DESC, sortOrder ASC, name ASC
    `
  );

  const staff = rows as StaffRow[];
  return json<LoaderData>({ user, staff });
};

export default function AdminStaffIndexPage() {
  const { user, staff } = useLoaderData<LoaderData>();

  return (
    <AdminLayout user={user} title="Staff & administration">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Staff members
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage teachers and administrative staff shown on the staff and administration pages.
          </p>
        </div>
        <Link
          to="/admin/staff/new"
          className="inline-flex items-center rounded-full bg-[#800000] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#650000] transition"
        >
          + New staff member
        </Link>
      </div>

      {staff.length === 0 ? (
        <p className="text-sm text-gray-600">
          No staff members have been added yet.
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
                  Role
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Department
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Admin page
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Order
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr
                  key={member.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 align-top">
                    <span className="text-sm font-medium text-gray-900">
                      {member.name}
                    </span>
                  </td>
                  <td className="px-4 py-2 align-top text-[11px] text-gray-700">
                    {member.roleTitle}
                  </td>
                  <td className="px-4 py-2 align-top text-[11px] text-gray-600">
                    {member.department || "—"}
                  </td>
                  <td className="px-4 py-2 align-top text-[11px]">
                    {member.isInAdminPage ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] text-green-700">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[11px] text-gray-700">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 align-top text-[11px] text-gray-600">
                    {member.sortOrder}
                  </td>
                  <td className="px-4 py-2 align-top text-[11px]">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/staff/${member.id}/edit`}
                        className="text-[#800000] hover:underline"
                      >
                        Edit
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
