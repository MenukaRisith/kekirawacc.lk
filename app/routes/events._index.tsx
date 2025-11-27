// app/routes/events._index.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { pool } from "~/utils/db.server";

export const meta: MetaFunction = () => [
  { title: "Events & Calendar – Kekirawa Central College" },
  {
    name: "description",
    content:
      "Upcoming and past events at Kekirawa Central College – assemblies, competitions, sports meets, exhibitions and special programs.",
  },
];

type EventListRow = {
  id: number;
  title: string;
  slug: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string | null;
  coverImage: string | null;
  category: string | null;
  clubName: string | null;
};

type LoaderData = {
  events: EventListRow[];
  view: "upcoming" | "past";
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const viewParam = (url.searchParams.get("view") || "upcoming").toLowerCase();
  const view: "upcoming" | "past" =
    viewParam === "past" ? "past" : "upcoming";

  const now = new Date();

  const filters: string[] = [`e.status = 'PUBLISHED'`];
  const params: (Date | string | number)[] = [];

  if (view === "upcoming") {
    filters.push(`e.startDate >= ?`);
  } else {
    filters.push(`e.startDate < ?`);
  }
  params.push(now);

  const whereSql = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const orderSql =
    view === "upcoming"
      ? "ORDER BY e.startDate ASC"
      : "ORDER BY e.startDate DESC";

  const [rowsRaw] = await pool.query(
    `
      SELECT
        e.id,
        e.title,
        e.slug,
        e.description,
        e.location,
        e.startDate,
        e.endDate,
        e.coverImage,
        e.category,
        c.name AS clubName
      FROM Event e
      LEFT JOIN Club c ON e.clubId = c.id
      ${whereSql}
      ${orderSql}
      LIMIT 30
    `,
    params
  );
  const rows = rowsRaw as EventListRow[];

  return json<LoaderData>({ events: rows, view });
};

export default function EventsIndexPage() {
  const data = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();

  const setViewUrl = (view: "upcoming" | "past") => {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);
    return `?${params.toString()}`;
  };

  const title =
    data.view === "upcoming" ? "Upcoming Events" : "Past Events & Highlights";
  const subtitle =
    data.view === "upcoming"
      ? "Stay ready for assemblies, competitions, sports and special programs happening soon at KCC."
      : "Look back at the events, competitions and milestones our students have taken part in.";

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* Hero / filters */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#800000] mb-2">
            Events & Calendar
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">{title}</h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl">
            {subtitle}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to={setViewUrl("upcoming")}
              className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                data.view === "upcoming"
                  ? "bg-[#800000] border-[#800000] text-white"
                  : "bg-white border-gray-200 text-gray-800 hover:border-[#800000]/60"
              }`}
            >
              Upcoming
            </Link>
            <Link
              to={setViewUrl("past")}
              className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                data.view === "past"
                  ? "bg-[#800000] border-[#800000] text-white"
                  : "bg-white border-gray-200 text-gray-800 hover:border-[#800000]/60"
              }`}
            >
              Past events
            </Link>
          </div>
        </div>
      </section>

      {/* Event list */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        {data.events.length === 0 ? (
          <p className="text-sm text-gray-600">
            No events found in this view. Please check again later.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {data.events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {event.coverImage && (
                  <div className="aspect-[16/9] bg-gray-100">
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
                    />
                  </div>
                )}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-[11px] text-gray-600">
                      {formatDateTimeRange(event.startDate, event.endDate)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {event.category && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-gray-700">
                          {event.category}
                        </span>
                      )}
                      {event.clubName && (
                        <span className="inline-flex items-center rounded-full bg-[#800000]/5 border border-[#800000]/20 px-2 py-0.5 text-[10px] text-[#800000]">
                          {event.clubName}
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                    {event.title}
                  </h2>

                  <p className="text-[11px] text-gray-600 mb-2">
                    {event.location}
                  </p>

                  <p className="text-xs text-gray-600 line-clamp-3 mb-3">
                    {stripHtml(event.description)}
                  </p>

                  <div className="mt-auto">
                    <span className="text-[11px] font-semibold text-[#800000] group-hover:underline">
                      View event details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* === helpers === */

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

  if (!end) {
    return `${datePart} · ${timePart}`;
  }

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

function stripHtml(html: string, maxLength = 200): string {
  const text = html.replace(/<[^>]+>/g, "").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}
