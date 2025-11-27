// app/routes/alumni.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { pool } from "~/utils/db.server";

export const meta: MetaFunction = () => [
  { title: "Notable Alumni – Kekirawa Central College" },
  {
    name: "description",
    content:
      "Notable alumni of Kekirawa Central College who have contributed in various fields in Sri Lanka and around the world.",
  },
];

type AlumniRow = {
  id: number;
  name: string;
  slug: string;
  gradYear: number | null;
  photoUrl: string | null;
  headline: string | null;
  bio: string | null;
  achievements: string | null;
  isFeatured: 0 | 1;
  category: string | null; // from DB, e.g. "Political", "Military"
};

type YearOption = {
  year: number;
};

type LoaderData = {
  alumni: AlumniRow[];
  years: YearOption[];
  selectedYear: number | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year");
  const selectedYear = yearParam ? Number(yearParam) : null;

  const filters: string[] = [];
  const params: number[] = [];

  if (!Number.isNaN(selectedYear) && selectedYear) {
    filters.push("a.gradYear = ?");
    params.push(selectedYear);
  }

  const whereSql = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const [rowsRaw] = await pool.query(
    `
      SELECT
        id,
        name,
        slug,
        gradYear,
        photoUrl,
        headline,
        bio,
        achievements,
        isFeatured,
        category
      FROM Alumni a
      ${whereSql}
      ORDER BY isFeatured DESC, gradYear DESC, name ASC
      LIMIT 60
    `,
    params
  );

  const alumni = rowsRaw as AlumniRow[];

  const [yearRowsRaw] = await pool.query(
    `
      SELECT DISTINCT gradYear AS year
      FROM Alumni
      WHERE gradYear IS NOT NULL
      ORDER BY gradYear DESC
    `
  );

  const years = yearRowsRaw as YearOption[];

  return json<LoaderData>({
    alumni,
    years,
    selectedYear:
      !Number.isNaN(selectedYear) && selectedYear ? selectedYear : null,
  });
};

export default function AlumniPage() {
  const { alumni, years, selectedYear } = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();

  const buildYearUrl = (year: number | null) => {
    const params = new URLSearchParams(searchParams);
    if (year) {
      params.set("year", String(year));
    } else {
      params.delete("year");
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  };

  // Group alumni by category field from DB
  const groupsMap = new Map<string, AlumniRow[]>();

  for (const person of alumni) {
    const label = person.category?.trim() || "Other fields";
    const existing = groupsMap.get(label) ?? [];
    existing.push(person);
    groupsMap.set(label, existing);
  }

  // Convert to array and sort categories (keep "Other fields" last)
    const categoryGroups = Array.from(groupsMap.entries())
      .map(([categoryLabel, items]) => ({ categoryLabel, items }))
      .sort((a, b) => {
        // 1) Political first
        if (a.categoryLabel === "Political / Public Service") return -1;
        if (b.categoryLabel === "Political / Public Service") return 1;

        // 2) Military last
        if (a.categoryLabel === "Military") return 1;
        if (b.categoryLabel === "Military") return -1;

        // 3) Otherwise alphabetical
        return a.categoryLabel.localeCompare(b.categoryLabel);
      });


  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* Hero */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#800000] mb-2">
            Alumni
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            Old Boys &amp; Girls of Kekirawa Central College
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl">
            A glimpse of past students who carried the spirit of &quot;Duty
            First&quot; into universities, professions and service across Sri
            Lanka and the world.
          </p>

          {/* Year filter chips */}
          {years.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to={buildYearUrl(null)}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                  !selectedYear
                    ? "bg-[#800000] border-[#800000] text-white"
                    : "bg-white border-gray-200 text-gray-800 hover:border-[#800000]/60"
                }`}
              >
                All years
              </Link>
              {years.map((y) => (
                <Link
                  key={y.year}
                  to={buildYearUrl(y.year)}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                    selectedYear === y.year
                      ? "bg-[#800000] border-[#800000] text-white"
                      : "bg-white border-gray-200 text-gray-800 hover:border-[#800000]/60"
                  }`}
                >
                  {y.year}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14 space-y-10">
        {alumni.length === 0 ? (
          <p className="text-sm text-gray-600">
            Alumni details will be added soon.
          </p>
        ) : (
          <>
            {categoryGroups.map(({ categoryLabel, items }) => (
              <div key={categoryLabel} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm md:text-base font-semibold text-gray-900">
                    {categoryLabel}
                  </h2>
                  <span className="text-[11px] text-gray-500">
                    {items.length} alum
                    {items.length === 1 ? "" : "ni"} listed
                  </span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((person) => (
                    <AlumniCard key={person.id} person={person} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  );
}

/* === Card component === */

function AlumniCard({ person }: { person: AlumniRow }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition">
      {/* Top photo */}
      <div className="relative">
        <div className="aspect-[3/4] bg-gray-100">
          {person.photoUrl ? (
            <img
              src={person.photoUrl}
              alt={person.name}
              className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-2xl font-semibold text-[#800000]">
              {getInitials(person.name)}
            </div>
          )}
        </div>

        {/* Featured ribbon */}
        {person.isFeatured === 1 && (
          <div className="absolute top-3 left-3 rounded-full bg-[#800000]/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            Featured alum
          </div>
        )}

        {/* Grad year pill */}
        {person.gradYear && (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/70 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-white">
            Batch of {person.gradYear}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <h2 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2">
            {person.name}
          </h2>
          {person.headline && (
            <p className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">
              {person.headline}
            </p>
          )}
        </div>

        {person.achievements && (
          <p className="text-xs text-gray-700 mb-1 line-clamp-3 whitespace-pre-line">
            {person.achievements}
          </p>
        )}

        {person.bio && (
          <p className="text-[11px] text-gray-600 line-clamp-3 whitespace-pre-line">
            {person.bio}
          </p>
        )}

        <div className="mt-3">
          <span className="text-[11px] font-semibold text-[#800000]">
            Profile details
          </span>
        </div>
      </div>
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
