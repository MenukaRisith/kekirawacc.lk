// app/routes/clubs.$slug.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { pool } from "~/utils/db.server";

/* ===== Types ===== */

type ClubDetailRow = {
  id: number;
  name: string;
  slug: string;
  shortName: string | null;
  category: string | null;
  description: string;
  coverImage: string | null;
  logoImage: string | null;
};

type ClubDetailRowFromDb = ClubDetailRow & {
  teacherInChargeJson: string | null;
  committeeMembersJson: string | null;
};

type ClubNewsRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  coverImage: string | null;
};

type ClubEventRow = {
  id: number;
  title: string;
  slug: string;
  location: string;
  startDate: string;
  endDate: string | null;
  category: string | null;
  coverImage: string | null;
};

type ClubPerson = {
  name: string;
  roleTitle: string;
  photoUrl: string | null;
  sortOrder: number;
};

type LoaderData = {
  club: ClubDetailRow;
  news: ClubNewsRow[];
  events: ClubEventRow[];
  teachers: ClubPerson[];
  committee: ClubPerson[];
};

/* ===== Loader ===== */

export const loader: LoaderFunction = async ({ params }) => {
  const slug = (params.slug || "").toString().trim();
  if (!slug) throw redirect("/clubs");

  // 1) Club
  const [clubRowsRaw] = await pool.query(
    `
      SELECT
        id,
        name,
        slug,
        shortName,
        category,
        description,
        coverImage,
        logoImage,
        teacherInChargeJson,
        committeeMembersJson
      FROM Club
      WHERE slug = ?
      LIMIT 1
    `,
    [slug]
  );

  const clubRows = clubRowsRaw as ClubDetailRowFromDb[];

  if (!clubRows || clubRows.length === 0) {
    throw redirect("/clubs");
  }

  const clubRow = clubRows[0];

  const club: ClubDetailRow = {
    id: clubRow.id,
    name: clubRow.name,
    slug: clubRow.slug,
    shortName: clubRow.shortName,
    category: clubRow.category,
    description: clubRow.description,
    coverImage: clubRow.coverImage,
    logoImage: clubRow.logoImage,
  };

  const teachers = parsePeopleJson(clubRow.teacherInChargeJson);
  const committee = parsePeopleJson(clubRow.committeeMembersJson);

  // 2) Recent news for this club (with image)
  const [newsRowsRaw] = await pool.query(
    `
      SELECT
        id,
        title,
        slug,
        excerpt,
        publishedAt,
        coverImage
      FROM NewsPost
      WHERE status = 'PUBLISHED'
        AND publishedAt IS NOT NULL
        AND clubId = ?
      ORDER BY publishedAt DESC
      LIMIT 4
    `,
    [club.id]
  );

  const newsRows = newsRowsRaw as ClubNewsRow[];

  // 3) Upcoming events for this club (with image)
  const now = new Date();
  const [eventRowsRaw] = await pool.query(
    `
      SELECT
        id,
        title,
        slug,
        location,
        startDate,
        endDate,
        category,
        coverImage
      FROM Event
      WHERE status = 'PUBLISHED'
        AND clubId = ?
        AND startDate >= ?
      ORDER BY startDate ASC
      LIMIT 4
    `,
    [club.id, now]
  );

  const eventRows = eventRowsRaw as ClubEventRow[];

  return json<LoaderData>({
    club,
    news: newsRows,
    events: eventRows,
    teachers,
    committee,
  });
};

/* ===== Meta ===== */

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "Clubs & Societies – Kekirawa Central College" },
      {
        name: "description",
        content:
          "Explore clubs and societies at Kekirawa Central College – ICT, Science, Sports, Arts and more.",
      },
    ];
  }

  const { club } = data;

  return [
    { title: `${club.name} – Club at Kekirawa Central College` },
    {
      name: "description",
      content:
        stripText(club.description, 150) ||
        "Club or society at Kekirawa Central College.",
    },
  ];
};

/* ===== Page ===== */

export default function ClubSlugPage() {
  const { club, news, events, teachers, committee } =
    useLoaderData<LoaderData>();

  // Split committee into "leader" (root node) + others for tree layout
  const committeeLeader = committee.length > 0 ? committee[0] : null;
  const committeeRest = committee.length > 1 ? committee.slice(1) : [];

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* Hero / cover */}
      <section className="relative border-b border-gray-200 bg-white">
        <div className="absolute inset-0">
          {club.coverImage ? (
            <div className="h-full w-full opacity-40">
              <img
                src={club.coverImage}
                alt={club.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-[#800000]/5 via-gray-100 to-[#FACC15]/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/60" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-8 md:pt-12 md:pb-10">
          <div className="mb-4">
            <Link
              to="/clubs"
              className="inline-flex items-center text-xs font-semibold text-[#800000] hover:underline"
            >
              ← Back to clubs & societies
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl border border-gray-200 bg-white shadow-sm flex items-center justify-center overflow-hidden">
                {club.logoImage ? (
                  <img
                    src={club.logoImage}
                    alt={`${club.name} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-[#800000] text-center px-1">
                    {club.shortName || club.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#800000] mb-1">
                Club & Society
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
                {club.name}
              </h1>
              {club.category && (
                <p className="text-[11px] uppercase tracking-[0.15em] text-gray-600 mb-1">
                  {club.category}
                </p>
              )}
              {club.shortName && (
                <p className="text-xs text-gray-600">
                  Also known as{" "}
                  <span className="font-semibold">{club.shortName}</span>.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About & content + people */}
      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          {/* About / description */}
          <div>
            <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
              About this club
            </h2>
            <div className="prose prose-sm md:prose-base max-w-none prose-p:text-gray-800">
              <p className="whitespace-pre-line">{club.description}</p>
            </div>
          </div>

          {/* Sidebar – teachers + committee tree */}
          <aside className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 text-xs text-gray-700 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-900 mb-1">
                Quick info
              </h3>
              <p className="mb-1">
                <span className="font-medium text-gray-800">Type:</span>{" "}
                {club.category || "Student-led club"}
              </p>
            </div>

            {teachers.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2">
                  Teachers-in-charge
                </h3>
                <div className="space-y-2">
                  {teachers.map((t) => (
                    <div
                      key={`${t.name}-${t.roleTitle}`}
                      className="flex gap-2"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {t.photoUrl ? (
                            <img
                              src={t.photoUrl}
                              alt={t.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-[11px] font-semibold text-[#800000]">
                              {getInitials(t.name)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">
                          {t.name}
                        </p>
                        {t.roleTitle && (
                          <p className="text-[11px] text-gray-600">
                            {t.roleTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {committee.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-3">
                  Student committee
                </h3>

                {/* Tree root (leader) */}
                {committeeLeader && (
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                      {committeeLeader.photoUrl ? (
                        <img
                          src={committeeLeader.photoUrl}
                          alt={committeeLeader.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-[#800000]">
                          {getInitials(committeeLeader.name)}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs font-semibold text-gray-900">
                      {committeeLeader.name}
                    </p>
                    {committeeLeader.roleTitle && (
                      <p className="text-[11px] text-gray-600">
                        {committeeLeader.roleTitle}
                      </p>
                    )}

                    {committeeRest.length > 0 && (
                      <div className="mt-3 h-6 w-px bg-gray-300" />
                    )}
                  </div>
                )}

                {/* Tree branches (other members) */}
                {committeeRest.length > 0 && (
                  <div className="relative pl-4">
                    {/* Vertical line */}
                    <div className="absolute left-1.5 top-0 bottom-0 border-l border-gray-200" />
                    <div className="space-y-3">
                      {committeeRest.map((m) => (
                        <div
                          key={`${m.name}-${m.roleTitle}-${m.sortOrder}`}
                          className="relative flex items-center gap-2"
                        >
                          {/* Tree node dot */}
                          <div className="absolute -left-[7px] h-3 w-3 rounded-full border border-gray-300 bg-white" />
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                              {m.photoUrl ? (
                                <img
                                  src={m.photoUrl}
                                  alt={m.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-semibold text-[#800000]">
                                  {getInitials(m.name)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-gray-900 leading-tight">
                              {m.name}
                            </p>
                            {m.roleTitle && (
                              <p className="text-[10px] text-gray-600 leading-tight">
                                {m.roleTitle}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {teachers.length === 0 && committee.length === 0 && (
              <p className="text-[11px] text-gray-500">
                Staff-in-charge and committee details can be added from the
                admin panel.
              </p>
            )}
          </aside>
        </div>
      </section>

      {/* News from this club */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#800000] mb-1">
                Updates
              </p>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                News from {club.shortName || club.name}
              </h2>
            </div>
            <Link
              to={`/news?club=${club.slug}`}
              className="text-xs font-semibold text-[#800000] hover:underline"
            >
              View all news linked to this club →
            </Link>
          </div>

          {news.length === 0 ? (
            <p className="text-sm text-gray-600">
              No news posts have been added for this club yet.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {news.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-md transition overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div className="w-full aspect-[16/9] bg-gray-100">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[11px] text-gray-500">
                        News image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-[11px] text-gray-500 mb-1">
                      {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                    </p>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-auto pt-1">
                      <Link
                        to={`/news/${post.slug}`}
                        className="text-[11px] font-semibold text-[#800000] hover:underline"
                      >
                        Read full story →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Events by this club */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#800000] mb-1">
                Events
              </p>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Upcoming events organised by this club
              </h2>
            </div>
            <Link
              to={`/events?view=upcoming`}
              className="text-xs font-semibold text-[#800000] hover:underline"
            >
              Go to full events calendar →
            </Link>
          </div>

          {events.length === 0 ? (
            <p className="text-sm text-gray-600">
              No upcoming events currently listed for this club.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div className="w-full aspect-[16/9] bg-gray-100">
                    {event.coverImage ? (
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[11px] text-gray-500">
                        Event image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-[11px] text-gray-600 mb-1">
                      {formatDateTimeRange(event.startDate, event.endDate)}
                    </p>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 mb-2">
                      {event.location}
                    </p>
                    {event.category && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-gray-700 mt-auto">
                        {event.category}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ===== Helpers ===== */

function stripText(value: string, max = 200): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function formatDate(value: string): string {
  const d = new Date(value);
  return d.toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTimeRange(startStr: string, endStr: string | null): string {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : null;

  const datePart = start.toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timePart = start.toLocaleTimeString("en-LK", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!end) return `${datePart} · ${timePart}`;

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const endTime = end.toLocaleTimeString("en-LK", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (sameDay) {
    return `${datePart} · ${timePart} – ${endTime}`;
  }

  const endDateTime = end.toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} · ${timePart} – ${endDateTime}`;
}

function parsePeopleJson(value: unknown): ClubPerson[] {
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;

        const obj = item as Record<string, unknown>;
        const name = String(obj.name ?? "").trim();
        const roleTitle = String(obj.roleTitle ?? "").trim();

        const rawPhoto = obj.photoUrl;
        const photoUrl =
          typeof rawPhoto === "string" && rawPhoto.trim().length > 0
            ? rawPhoto.trim()
            : null;

        const rawSort = obj.sortOrder;
        const sortOrder =
          typeof rawSort === "number"
            ? rawSort
            : Number.isFinite(rawSort as number)
            ? Number(rawSort)
            : index;

        if (!name && !roleTitle) return null;

        return {
          name,
          roleTitle,
          photoUrl,
          sortOrder,
        } satisfies ClubPerson;
      })
      .filter((p): p is ClubPerson => Boolean(p))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [];
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    (parts[0].charAt(0) || "").toUpperCase() +
    (parts[parts.length - 1].charAt(0) || "").toUpperCase()
  );
}
