// app/routes/events.$slug.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { pool } from "~/utils/db.server";

type EventDetailRow = {
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
  event: EventDetailRow;
};

export const loader: LoaderFunction = async ({ params }) => {
  const slug = (params.slug || "").toString().trim();
  if (!slug) throw redirect("/events");

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
      WHERE e.slug = ?
        AND e.status = 'PUBLISHED'
      LIMIT 1
    `,
    [slug]
  );

  const rows = rowsRaw as EventDetailRow[];

  if (!rows || rows.length === 0) {
    throw redirect("/events");
  }

  return json<LoaderData>({ event: rows[0] });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "Events – Kekirawa Central College" },
      {
        name: "description",
        content: "Events and calendar at Kekirawa Central College.",
      },
    ];
  }

  const { event } = data;
  return [
    { title: `${event.title} – Kekirawa Central College` },
    {
      name: "description",
      content: stripHtml(event.description, 160),
    },
  ];
};

export default function EventSlugPage() {
  const { event } = useLoaderData<LoaderData>();

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      <article className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        {/* Back link */}
        <div className="mb-4">
          <Link
            to="/events"
            className="inline-flex items-center text-xs font-semibold text-[#800000] hover:underline"
          >
            ← Back to events
          </Link>
        </div>

        {/* Meta */}
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#800000] mb-2">
          Event
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold mb-3">
          {event.title}
        </h1>

        <div className="flex flex-wrap gap-2 text-[11px] text-gray-600 mb-4">
          <span>{formatDateTimeRange(event.startDate, event.endDate)}</span>
          <span className="mx-1">•</span>
          <span>{event.location}</span>
          {event.category && (
            <>
              <span className="mx-1">•</span>
              <span className="uppercase tracking-[0.15em] text-gray-700">
                {event.category}
              </span>
            </>
          )}
          {event.clubName && (
            <>
              <span className="mx-1">•</span>
              <span className="font-medium text-gray-800">
                {event.clubName}
              </span>
            </>
          )}
        </div>

        {/* Cover image */}
        {event.coverImage && (
          <div className="mb-6 rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={event.coverImage}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Description - rich text from admin editor */}
        <div
          className="prose prose-sm md:prose-base max-w-none prose-img:rounded-xl prose-headings:text-gray-900 prose-p:text-gray-800 prose-a:text-[#800000] hover:prose-a:text-[#650000]"
          dangerouslySetInnerHTML={{ __html: event.description }}
        />

        {/* Bottom actions */}
        <div className="mt-10 border-t border-gray-200 pt-4 flex flex-wrap gap-3 items-center justify-between text-xs">
          <Link
            to="/events"
            className="inline-flex items-center text-xs font-semibold text-[#800000] hover:underline"
          >
            ← View all events
          </Link>
          {event.clubName && (
            <span className="text-[11px] text-gray-600">
              Organised with{" "}
              <span className="font-medium text-gray-800">
                {event.clubName}
              </span>
            </span>
          )}
        </div>
      </article>
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
