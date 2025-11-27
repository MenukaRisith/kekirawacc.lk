// app/routes/clubs._index.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { pool } from "~/utils/db.server";

export const meta: MetaFunction = () => [
  { title: "Clubs & Societies – Kekirawa Central College" },
  {
    name: "description",
    content:
      "Explore clubs and societies at Kekirawa Central College – ICT, Science, Sports, Arts, Community Service and more.",
  },
];

type ClubRow = {
  id: number;
  name: string;
  slug: string;
  shortName: string | null;
  category: string | null;
  description: string;
  coverImage: string | null;
  logoImage: string | null;
};

type LoaderData = {
  clubs: ClubRow[];
};

export const loader: LoaderFunction = async () => {
  const [rowsRaw] = await pool.query(
    `
      SELECT
        id,
        name,
        slug,
        shortName,
        category,
        description,
        coverImage,
        logoImage
      FROM Club
      ORDER BY category IS NULL, category ASC, name ASC
    `
  );

  const rows = rowsRaw as ClubRow[];

  return json<LoaderData>({ clubs: rows });
};

export default function ClubsIndexPage() {
  const { clubs } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get("category") || "all";

  // Build category list from clubs (non-null)
  const categorySet = new Set<string>();
  let hasUncategorized = false;

  for (const club of clubs) {
    if (club.category && club.category.trim().length > 0) {
      categorySet.add(club.category.trim());
    } else {
      hasUncategorized = true;
    }
  }

  const categories = Array.from(categorySet).sort((a, b) =>
    a.localeCompare(b)
  );

  // Helper to update category filter in URL
  const setCategory = (category: string) => {
    const next = new URLSearchParams(searchParams);
    if (category === "all") {
      next.delete("category");
    } else {
      next.set("category", category);
    }
    setSearchParams(next);
  };

  // Group clubs by category for "all" view and also count per category
  const groupedByCategory = new Map<string, ClubRow[]>();
  const categoryCounts = new Map<string, number>();

  for (const club of clubs) {
    const key =
      club.category && club.category.trim().length > 0
        ? club.category.trim()
        : "Other";

    if (!groupedByCategory.has(key)) {
      groupedByCategory.set(key, []);
    }
    groupedByCategory.get(key)!.push(club);

    categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
  }

  const orderedGroupKeys: string[] = [];
  for (const c of categories) {
    if (groupedByCategory.has(c)) orderedGroupKeys.push(c);
  }
  if (groupedByCategory.has("Other")) {
    orderedGroupKeys.push("Other");
  }

  // Filtered clubs when a specific category is selected
  let filteredClubs: ClubRow[] = clubs;
  let selectedCategoryLabel: string | null = null;

  if (activeCategory !== "all") {
    if (activeCategory === "Other") {
      filteredClubs = clubs.filter(
        (club) => !club.category || club.category.trim().length === 0
      );
      selectedCategoryLabel = "Other";
    } else {
      filteredClubs = clubs.filter(
        (club) => club.category && club.category.trim() === activeCategory
      );
      selectedCategoryLabel = activeCategory;
    }
  }

  const totalClubs = clubs.length;

  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-100 min-h-screen text-gray-900">
      {/* Hero */}
      <section className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#800000] mb-2">
            Clubs & Societies
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold mb-3">
                Student leadership beyond the classroom
              </h1>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl">
                From ICT and Science to Sports, Arts and Service, clubs at KCC
                help students organise events, compete, and build their skills
                as teams.
              </p>
            </div>
            <div className="text-xs md:text-sm text-gray-500 md:text-right">
              <p className="font-semibold text-gray-800">
                {totalClubs}{" "}
                {totalClubs === 1 ? "active club" : "active clubs"}
              </p>
              <p>
                {categories.length}{" "}
                {categories.length === 1 ? "category" : "categories"}{" "}
                represented
              </p>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  activeCategory === "all"
                    ? "bg-[#800000] border-[#800000] text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-800 hover:border-[#800000]/60"
                }`}
              >
                All clubs
                <span className="ml-2 text-[10px] opacity-80">
                  {totalClubs}
                </span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                    activeCategory === cat
                      ? "bg-[#800000] border-[#800000] text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-800 hover:border-[#800000]/60"
                  }`}
                >
                  {cat}
                  <span className="ml-2 text-[10px] opacity-80">
                    {categoryCounts.get(cat) ?? 0}
                  </span>
                </button>
              ))}

              {hasUncategorized && (
                <button
                  type="button"
                  onClick={() => setCategory("Other")}
                  className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                    activeCategory === "Other"
                      ? "bg-[#800000] border-[#800000] text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-800 hover:border-[#800000]/60"
                  }`}
                >
                  Other
                  <span className="ml-2 text-[10px] opacity-80">
                    {categoryCounts.get("Other") ?? 0}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Club cards */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        {clubs.length === 0 ? (
          <p className="text-sm text-gray-600">
            Clubs and societies will be added soon.
          </p>
        ) : activeCategory === "all" ? (
          // ALL VIEW – grouped by category
          orderedGroupKeys.map((groupKey) => {
            const groupClubs = groupedByCategory.get(groupKey) || [];
            if (groupClubs.length === 0) return null;
            const label =
              groupKey === "Other" ? "Other clubs" : groupKey;

            return (
              <div
                key={groupKey}
                className="mb-12 last:mb-0 border border-gray-200/70 rounded-2xl bg-white/80 shadow-sm"
              >
                <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100">
                  <h2 className="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#800000]/5 text-[11px] text-[#800000]">
                      {label.charAt(0)}
                    </span>
                    <span>{label}</span>
                  </h2>
                  <span className="text-[11px] text-gray-500">
                    {groupClubs.length}{" "}
                    {groupClubs.length === 1 ? "club" : "clubs"}
                  </span>
                </div>
                <div className="p-4">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {groupClubs.map((club) => (
                      <ClubCard key={club.id} club={club} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : filteredClubs.length === 0 ? (
          // FILTERED VIEW – no clubs
          <p className="text-sm text-gray-600">
            No clubs found under{" "}
            <span className="font-semibold">
              {selectedCategoryLabel || activeCategory}
            </span>
            .
          </p>
        ) : (
          // FILTERED VIEW – single grid
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm md:text-base font-semibold text-gray-900">
                {selectedCategoryLabel === "Other"
                  ? "Other clubs"
                  : selectedCategoryLabel}
                <span className="text-[11px] text-gray-500 font-normal ml-1.5">
                  · {filteredClubs.length}{" "}
                  {filteredClubs.length === 1 ? "club" : "clubs"}
                </span>
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* Small presentational component to keep JSX clean */

function ClubCard({ club }: { club: ClubRow }) {
  return (
    <Link
      to={`/clubs/${club.slug}`}
      className="group flex flex-col rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Top visual with overlay */}
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          {club.coverImage ? (
            <img
              src={club.coverImage}
              alt={club.name}
              className="h-full w-full object-cover transform group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[11px] text-gray-500">
              Club cover image
            </div>
          )}
        </div>

        {/* Gradient overlay on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Logo bubble */}
        {club.logoImage && (
          <div className="absolute -bottom-6 left-4 h-12 w-12 rounded-xl border border-white shadow-md overflow-hidden bg-white">
            <img
              src={club.logoImage}
              alt={`${club.name} logo`}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Category chip in corner */}
        {club.category && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center rounded-full bg-black/40 text-white px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] backdrop-blur-sm">
              {club.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-7 px-4 pb-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2">
            {club.name}
          </h2>
          {club.shortName && (
            <span className="text-[10px] font-semibold text-[#800000] bg-[#800000]/6 border border-[#800000]/20 rounded-full px-2 py-0.5">
              {club.shortName}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-600 line-clamp-3 mb-3">
          {club.description}
        </p>

        <div className="mt-auto flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[#800000] group-hover:underline">
            View club page →
          </span>
        </div>
      </div>
    </Link>
  );
}
