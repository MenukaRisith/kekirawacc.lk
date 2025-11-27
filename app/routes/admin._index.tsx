// app/routes/admin._index.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { pool } from "~/utils/db.server";
import {
  requireUserWithRole,
  type AuthUser,
} from "~/utils/auth.server";

export const meta: MetaFunction = () => [
  { title: "Admin Dashboard – Kekirawa Central College" },
];

type DashboardStats = {
  newsCount: number;
  eventCount: number;
  clubCount: number;
};

type LoaderData = {
  user: AuthUser;
  stats: DashboardStats;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserWithRole(request, [
    "ADMIN",
    "AUTHOR",
    "CLUB_REP",
  ]);

  const [newsRows] = await pool.query(
    `SELECT COUNT(*) AS count FROM NewsPost WHERE status = 'PUBLISHED'`
  );
  const [eventRows] = await pool.query(
    `SELECT COUNT(*) AS count FROM Event WHERE status = 'PUBLISHED'`
  );
  const [clubRows] = await pool.query(
    `SELECT COUNT(*) AS count FROM Club`
  );

  const newsCount = (newsRows as { count: number }[])[0]?.count ?? 0;
  const eventCount = (eventRows as { count: number }[])[0]?.count ?? 0;
  const clubCount = (clubRows as { count: number }[])[0]?.count ?? 0;

  return json<LoaderData>({
    user,
    stats: { newsCount, eventCount, clubCount },
  });
};

import { AdminLayout } from "~/components/admin/AdminLayout";

export default function AdminIndexPage() {
  const { user, stats } = useLoaderData<LoaderData>();

  return (
    <AdminLayout user={user} title="Dashboard">
      <section className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Published News"
          value={stats.newsCount}
          description="Total news posts visible on the website."
          linkLabel="Manage news"
          to="/admin/news"
        />
        <DashboardCard
          title="Upcoming Events"
          value={stats.eventCount}
          description="Active events on the school calendar."
          linkLabel="Manage events"
          to="/admin/events"
        />
        <DashboardCard
          title="Clubs & Societies"
          value={stats.clubCount}
          description="Registered clubs with profiles."
          linkLabel="Manage clubs"
          to="/admin/clubs"
        />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <QuickPanel
          title="Quick actions"
          items={[
            { label: "Create news post", to: "/admin/news/new" },
            { label: "Add new event", to: "/admin/events/new" },
            { label: "Register a new club", to: "/admin/clubs/new" },
          ]}
        />
        <QuickPanel
          title="Helpful links"
          items={[
            { label: "View public homepage", to: "/" },
            { label: "Visit news page", to: "/news" },
            { label: "View events calendar", to: "/events" },
          ]}
        />
      </section>
    </AdminLayout>
  );
}

/* === Small local components === */

type DashboardCardProps = {
  title: string;
  value: number;
  description: string;
  to: string;
  linkLabel: string;
};

function DashboardCard({
  title,
  value,
  description,
  to,
  linkLabel,
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 md:p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
      <div className="mt-3">
        <Link
          to={to}
          className="text-xs font-semibold text-[#800000] hover:underline"
        >
          {linkLabel} →
        </Link>
      </div>
    </div>
  );
}

type QuickPanelProps = {
  title: string;
  items: { label: string; to: string }[];
};

function QuickPanel({ title, items }: QuickPanelProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 md:p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
      <ul className="space-y-2 text-xs">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="text-[#800000] hover:underline font-medium"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
