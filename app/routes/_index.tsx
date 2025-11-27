// app/routes/_index.tsx
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { pool } from "~/utils/db.server";

export const meta: MetaFunction = () => [
  { title: "Kekirawa Central College – Duty First" },
  {
    name: "description",
    content:
      "Official website of Kekirawa Central College, a national school in Kekirawa, North Central Province. Founded in 1945 under Sri Lanka’s free education reforms, the College serves over 3,000 students from Grade 6–13.",
  },
];

/* ===== Types for DB rows & loader ===== */

type NewsRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null; // MySQL usually returns DATETIME as string
  coverImage: string | null;
};

type EventRow = {
  id: number;
  title: string;
  slug: string;
  location: string;
  startDate: string; // DATETIME as string
  category: string | null;
  coverImage: string | null;
};

type LoaderData = {
  latestNews: NewsRow[];
  upcomingEvents: EventRow[];
};

/* ===== Loader: fetch data from MySQL ===== */

export const loader: LoaderFunction = async () => {
  const [newsRaw] = await pool.query(
    `
    SELECT id, title, slug, excerpt, publishedAt, coverImage
    FROM NewsPost
    WHERE status = 'PUBLISHED'
    ORDER BY publishedAt DESC
    LIMIT 4
    `
  );

  const [eventsRaw] = await pool.query(
    `
    SELECT id, title, slug, location, startDate, category, coverImage
    FROM Event
    WHERE status = 'PUBLISHED'
      AND startDate >= NOW()
    ORDER BY startDate ASC
    LIMIT 3
    `
  );

  const latestNews = newsRaw as NewsRow[];
  const upcomingEvents = eventsRaw as EventRow[];

  return json<LoaderData>({
    latestNews,
    upcomingEvents,
  });
};

/* ===== Page component ===== */

export default function IndexPage() {
  const { latestNews, upcomingEvents } = useLoaderData<LoaderData>();

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* HERO – full-width welcome */}
      <section className="relative overflow-hidden">
        {/* Background image + overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Background image */}
          <div className="h-full w-full bg-[url('/branding/bg-banner.webp')] bg-cover bg-center" />
          {/* Soft white overlay for readability */}
          <div className="absolute inset-0 bg-white/70" />
          {/* Subtle maroon gradient from top */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#800000]/10 via-transparent to-white" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-24 md:pb-28 flex flex-col items-center text-center">
          <p className="text-s tracking-[0.3em] uppercase text-[#800000]/80 mb-4">
            Welcome to
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Kekirawa Central College
          </h1>
          <p className="text-sm md:text-base font-semibold tracking-[0.25em] uppercase text-[#800000] mb-3">
            Duty First
          </p>
          <p className="max-w-2xl text-l md:text-base text-gray-700 mb-8">
            Kekirawa Central College is the first national school in the heart of
            the North Central Province, serving over 3,000 students from Grade
            6–13. Rooted in the legacy of free education, we nurture academic
            excellence, character and leadership for life.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <Link
              to="/life-at-kcc"
              className="inline-flex items-center rounded-full bg-[#800000] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#650000] transition"
            >
              Explore Life at KCC
            </Link>
            <Link
              to="/news"
              className="inline-flex items-center rounded-full border border-[#800000] px-6 py-2.5 text-sm font-semibold text-[#800000] bg-white hover:bg-[#800000]/5 transition"
            >
              View News &amp; Updates
            </Link>
          </div>

          {/* Small stat strip */}
          <div className="flex flex-wrap justify-center gap-6 text-xs md:text-sm text-gray-700">
            <StatPill label="Since" value="1945" />
            <StatPill label="Students" value="3,000+" />
            <StatPill label="Clubs & Societies" value="20+" />
          </div>
        </div>
      </section>

      {/* EXPERIENCE BLOCK – centered text */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            An Education Rooted in Duty and Opportunity.
          </h2>
          <p className="text-sm md:text-base text-gray-700 mb-4">
            Established in 1945 as one of the central colleges created under
            Hon. C.W.W. Kannangara’s free education reforms, Kekirawa Central
            College opened the doors of quality education to children in
            the North Central Province.
          </p>
          <p className="text-xs md:text-sm text-gray-600 mb-5">
            Today, as a national school, we continue that mission by blending
            strong classroom teaching with technology, co-curricular activities
            and community values — always guided by our enduring motto{" "}
            <span className="font-semibold text-[#800000]">“Duty First”.</span>
          </p>
          <Link
            to="/about"
            className="inline-flex items-center text-xs md:text-sm font-semibold text-[#800000] hover:underline"
          >
            Learn more about our story →
          </Link>
        </div>
      </section>

      {/* CAMPUS UPDATES – highlight cards from DB */}
      <section className="bg-[#FAF8F6] text-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#800000] font-semibold">
                Today&apos;s Updates
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mt-1 relative inline-block">
                Latest Highlights &amp; Notices
                <span className="absolute left-0 -bottom-2 w-24 h-[3px] bg-[#800000]" />
              </h2>
            </div>
            <Link
              to="/news"
              className="text-xs md:text-sm font-medium text-[#800000] hover:underline"
            >
              See all news &amp; announcements →
            </Link>
          </div>

          {latestNews.length === 0 ? (
            <p className="text-sm text-gray-600">
              No news has been published yet. Please check back soon for the
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {latestNews.map((post) => (
                <Link key={post.id} to={`/news/${post.slug}`}>
                  <TodayCard
                    label="News"
                    title={post.title}
                    date={formatNewsDate(post.publishedAt)}
                    imageSrc={post.coverImage}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* UPCOMING EVENTS – lighter section from DB */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#800000]">
                Upcoming Events
              </p>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                Stay Ahead of What&apos;s Next
              </h2>
            </div>
            <Link
              to="/events"
              className="text-xs md:text-sm font-medium text-[#800000] hover:underline"
            >
              View full event calendar →
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-600">
              No upcoming events are published at the moment. New programmes and
              schedules will appear here as they are confirmed.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {upcomingEvents.map((event) => (
                <Link key={event.id} to={`/events/${event.slug}`}>
                  <EventCard
                    date={formatEventShortDate(event.startDate)}
                    label={event.category || "Event"}
                    title={event.title}
                    meta={formatEventMeta(event.startDate, event.location)}
                    imageSrc={event.coverImage}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DIGITAL LEARNING SECTION */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#800000]">
              Learning with Technology
            </p>
            <h2 className="mt-2 text-xl md:text-2xl font-semibold text-gray-900">
              A Connected Classroom Experience
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-700">
              KCC steadily integrates digital tools, subject-based portals and
              ICT-focused programmes to support students in research,
              collaboration and self-paced learning.
            </p>
            <Link
              to="/academics"
              className="mt-4 inline-flex text-xs md:text-sm font-semibold text-[#800000] hover:underline"
            >
              Explore academic support →
            </Link>
          </div>

          <div className="relative">
            <div className="rounded-3xl bg-white shadow-lg border border-gray-200 p-4 md:p-6">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#800000]/10 via-gray-100 to-[#FACC15]/20 flex items-center justify-center">
                <div className="text-center px-6">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Digital classrooms, online resources, media coverage and
                    student-led ICT projects — building a modern learning
                    culture at KCC.
                  </p>
                  <p className="text-xs text-gray-500">
                    (Replace this placeholder with a real screenshot or
                    illustration of your school&apos;s digital systems.)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACADEMICS / CLUBS / SPORTS – vertical journey */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col items-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-[#800000]">
              Life at KCC
            </p>
            <h2 className="mt-2 text-xl md:text-2xl font-semibold text-gray-900">
              Learn, Lead and Compete
            </h2>
            <p className="mt-2 max-w-2xl text-xs md:text-sm text-gray-600 text-center">
              As a mixed national school, Kekirawa Central College offers a full
              journey from Grade 6 to GCE O/L and A/L — balancing studies with
              clubs, aesthetic activities and sports.
            </p>
          </div>

          <div className="relative">
            {/* central vertical line on large screens */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#FACC15] via-gray-300 to-[#FACC15]/60" />

            <FeatureRow
              align="left"
              heading="Academics"
              text="Academic life at Kekirawa Central College spans from Grade 6 to GCE O/L and A/L, with students guided through solid foundations in Mathematics, Science, Languages and Commerce. As a 1AB national school, KCC prepares learners for advanced study through dedicated Arts, Commerce and Science streams at Advanced Level, supported by seminars, university outreach programmes and extra revision classes. Teachers focus on discipline, exam readiness and future pathways, helping students connect classroom learning with higher education and careers."
              link="/academics"
              linkLabel="Discover academics"
              imageAlt="Students engaged in classroom learning"
              imageSrc="/images/academics.webp"
            />
            <FeatureRow
              align="right"
              heading="Clubs & Societies"
              text="Clubs and societies at Kekirawa Central College give students a structured space to discover their interests and take on real responsibility within the school. Academic, cultural, service, religious and aesthetic groups organise assemblies, competitions, awareness programmes and community projects throughout the year. Through planning events, speaking in front of peers and working in teams, students learn leadership, time management and collaboration that strongly complement their classroom learning."
              link="/clubs"
              linkLabel="View clubs & societies"
              imageAlt="Students participating in a club activity"
              imageSrc="/images/clubs.webp"
            />
            <FeatureRow
              align="left"
              heading="Sports"
              text="Sports at KCC build resilience, team spirit and school pride. Students train and compete in a range of games, carrying the maroon and gold colours to zonal, provincial and national arenas."
              link="/sports"
              linkLabel="Explore sports at KCC"
              imageAlt="Student in sports activity"
              imageSrc="/images/life/sports.webp"
            />
          </div>
        </div>
      </section>

      {/* HERITAGE / HISTORY BANNER */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="h-full w-full bg-[url('/branding/history-banner.webp')] bg-cover bg-center opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">
            The First Central College of the North Central Province
          </h2>
          <p className="text-sm md:text-base text-white/90 mb-4">
            Born in 1945 as part of the historic central college movement, our
            school brought the promise of free, quality education to the children
            of Kekirawa and the surrounding villages.
          </p>
          <p className="text-xs md:text-sm text-white/80 mb-5">
            Over the decades, generations of students, teachers and parents have
            shaped Kekirawa Central College into a respected national school —
            producing citizens who serve Sri Lanka and the world with knowledge,
            humility and a deep sense of duty.
          </p>
          <Link
            to="/history"
            className="inline-flex items-center rounded-full bg-white/90 px-6 py-2.5 text-sm font-semibold text-[#800000] hover:bg-white transition"
          >
            Explore our history
          </Link>
        </div>
      </section>
    </div>
  );
}

/* === Small helper components === */

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-[#FACC15]" />
      <span className="text-xs md:text-sm text-gray-700">
        <span className="font-semibold text-gray-900">{value}</span>{" "}
        <span className="text-gray-600">{label}</span>
      </span>
    </div>
  );
}

function TodayCard(props: {
  label: string;
  title: string;
  date: string;
  imageSrc?: string | null;
}) {
  const { label, title, date, imageSrc } = props;
  return (
    <div className="flex flex-col h-full rounded-2xl bg-white text-gray-900 shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden">
      {/* Image */}
      <div className="w-full aspect-[16/9] bg-gray-100">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[11px] text-gray-500">
            News image
          </div>
        )}
      </div>

      {/* Label bar */}
      <div className="bg-[#800000] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
        {label}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-3 text-xs md:text-sm">
        <p className="text-gray-500 text-[11px]">{date}</p>
        <h3 className="mt-2 font-semibold line-clamp-3">{title}</h3>
      </div>
      <div className="px-4 pb-3">
        <span className="text-[11px] font-semibold text-[#800000]">
          Read more →
        </span>
      </div>
    </div>
  );
}

function EventCard(props: {
  date: string;
  label: string;
  title: string;
  meta: string;
  imageSrc?: string | null;
}) {
  const { date, label, title, meta, imageSrc } = props;
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-md transition overflow-hidden">
      {/* Image */}
      <div className="w-full aspect-[16/9] bg-gray-100">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[11px] text-gray-500">
            Event image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex flex-col items-center justify-center rounded-xl bg-white border border-[#800000]/40 px-3 py-2 min-w-[68px]">
            <span className="text-lg font-bold text-gray-900 leading-tight">
              {date}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#800000]">
              {label}
            </p>
            <h3 className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2">
              {title}
            </h3>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-1">{meta}</p>
      </div>
    </div>
  );
}

type FeatureRowProps = {
  align: "left" | "right";
  heading: string;
  text: string;
  link: string;
  linkLabel: string;
  imageSrc: string;
  imageAlt: string;
};

function FeatureRow({
  align,
  heading,
  text,
  link,
  linkLabel,
  imageSrc,
  imageAlt,
}: FeatureRowProps) {
  const isLeft = align === "left";

  return (
    <div className="relative grid md:grid-cols-2 gap-10 md:gap-14 items-center py-10 md:py-12">
      {/* vertical marker */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-10">
        <div className="h-10 w-[2px] bg-[#FACC15]" />
      </div>

      <div
        className={`${
          isLeft ? "md:col-start-1" : "md:col-start-2"
        } space-y-3 md:space-y-4`}
      >
        <h3 className="text-lg md:text-xl font-semibold text-gray-900">
          {heading}
        </h3>
        <p className="text-sm md:text-base text-gray-700">{text}</p>
        <Link
          to={link}
          className="inline-flex text-xs md:text-sm font-semibold text-[#800000] hover:underline"
        >
          {linkLabel} →
        </Link>
      </div>

      <div
        className={`${
          isLeft ? "md:col-start-2" : "md:col-start-1"
        } flex justify-center`}
      >
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-white">
          <div className="aspect-[3/4] bg-gray-200">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Date formatting helpers ===== */

function formatNewsDate(date: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatEventShortDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

function formatEventMeta(date: string, location: string): string {
  const d = new Date(date);
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${timeStr} · ${location}`;
}
