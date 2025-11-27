// app/routes/administration._index.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { pool } from "~/utils/db.server";

export const meta: MetaFunction = () => [
  { title: "Administration – Kekirawa Central College" },
  {
    name: "description",
    content:
      "Principal, deputy principals and key administrative staff of Kekirawa Central College.",
  },
];

type AdminRow = {
  id: number;
  name: string;
  photoUrl: string | null;
  roleTitle: string;
  department: string | null;
  sortOrder: number;
};

type LoaderData = {
  admins: AdminRow[];
};

export const loader: LoaderFunction = async () => {
  const [rowsRaw] = await pool.query(
    `
      SELECT
        id,
        name,
        photoUrl,
        roleTitle,
        department,
        sortOrder
      FROM StaffMember
      WHERE isInAdminPage = 1
      ORDER BY sortOrder ASC, name ASC
    `
  );

  const rows = rowsRaw as AdminRow[];

  return json<LoaderData>({ admins: rows });
};

export default function AdministrationPage() {
  const { admins } = useLoaderData<LoaderData>();

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* Hero */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#800000] mb-2">
            Administration
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            Leadership of Kekirawa Central College
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl">
            The principal and administrative team who oversee academic
            standards, student welfare and the overall development of the
            college.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        {admins.length === 0 ? (
          <p className="text-sm text-gray-600">
            Administration details will be updated soon.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {admins.map((person, idx) => (
              <div
                key={person.id}
                className={`flex gap-4 rounded-2xl border border-gray-200 bg-white shadow-sm p-4 ${
                  idx === 0 ? "md:col-span-2 md:p-6" : ""
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    {person.photoUrl ? (
                      <img
                        src={person.photoUrl}
                        alt={person.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-[#800000]">
                        {getInitials(person.name)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {person.name}
                  </p>
                  <p className="mt-1 text-xs md:text-sm text-[#800000] font-medium">
                    {person.roleTitle}
                  </p>
                  {person.department && (
                    <p className="mt-0.5 text-[11px] text-gray-600">
                      {person.department}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* === helper === */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    (parts[0].charAt(0) || "").toUpperCase() +
    (parts[parts.length - 1].charAt(0) || "").toUpperCase()
  );
}
