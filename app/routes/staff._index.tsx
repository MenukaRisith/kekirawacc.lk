// app/routes/staff._index.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { pool } from "~/utils/db.server";

export const meta: MetaFunction = () => [
  { title: "Our Staff – Kekirawa Central College" },
  {
    name: "description",
    content:
      "Meet the teaching and non-academic staff of Kekirawa Central College.",
  },
];

type StaffRow = {
  id: number;
  name: string;
  photoUrl: string | null;
  roleTitle: string;
  department: string | null;
};

type LoaderData = {
  staff: StaffRow[];
};

export const loader: LoaderFunction = async () => {
  const [rowsRaw] = await pool.query(
    `
      SELECT
        id,
        name,
        photoUrl,
        roleTitle,
        department
      FROM StaffMember
      ORDER BY sortOrder ASC, name ASC
    `
  );

  const rows = rowsRaw as StaffRow[];

  return json<LoaderData>({ staff: rows });
};

export default function StaffIndexPage() {
  const { staff } = useLoaderData<LoaderData>();

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* Hero */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#800000] mb-2">
            Our Staff
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            Teachers & Staff of Kekirawa Central College
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl">
            The people who guide, support and mentor students every day in
            classrooms, laboratories, grounds and offices.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        {staff.length === 0 ? (
          <p className="text-sm text-gray-600">
            Staff details will be updated soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white shadow-sm p-4"
              >
                <div className="mb-3 h-20 w-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-[#800000]">
                      {getInitials(member.name)}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900 text-center line-clamp-2">
                  {member.name}
                </p>
                {member.roleTitle && (
                  <p className="mt-1 text-[11px] text-gray-600 text-center line-clamp-2">
                    {member.roleTitle}
                  </p>
                )}
                {member.department && (
                  <p className="mt-0.5 text-[10px] text-gray-500 text-center">
                    {member.department}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* === helpers === */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    (parts[0].charAt(0) || "").toUpperCase() +
    (parts[parts.length - 1].charAt(0) || "").toUpperCase()
  );
}
