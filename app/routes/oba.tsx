import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "Old Boys’ Association – Kekirawa Central College" },
  {
    name: "description",
    content:
      "Old Boys’ Association of Kekirawa Central College — strengthening the school community with support from past pupils nationwide and worldwide.",
  },
];

export default function OBAPage() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12 text-center">
          <p className="text-xs tracking-[0.32em] uppercase text-[#800000] mb-2">
            Old Boys’ Association
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            United Through Leadership & Loyalty
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto">
            The Old Boys’ Association (OBA) upholds the values of Kekirawa Central College
            while supporting school development, student welfare and the bond between
            past pupils across Sri Lanka and around the world.
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 md:p-8 text-sm md:text-base text-gray-700 space-y-3">
          <p>
            The Old Boys’ Association plays a vital role in strengthening the legacy of
            Kekirawa Central College. Through leadership, service and generosity, the OBA
            actively supports sports, education, infrastructure, events and student
            welfare initiatives.
          </p>
          <p>
            With a growing network of past pupils locally and internationally, the OBA
            fosters lifelong friendships while creating opportunities that benefit future
            generations of students.
          </p>
        </div>
      </section>

      {/* MAIN COMMITTEE */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              Executive Committee — Key Contacts
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto mt-2">
              The following members can be contacted regarding OBA membership,
              contributions, reunions and school development projects.
            </p>
          </div>

          {/* 3 PERSON GRID */}
          <div className="grid gap-6 md:grid-cols-3 text-sm">
            {/* Member 1 */}
            <MemberCard
              name="Name Here"
              // eslint-disable-next-line jsx-a11y/aria-role
              role="President – OBA"
              phone="+94 XX XXX XXXX"
              email="email@example.com"
            />

            {/* Member 2 */}
            <MemberCard
              name="Name Here"
              // eslint-disable-next-line jsx-a11y/aria-role
              role="Secretary – OBA"
              phone="+94 XX XXX XXXX"
              email="email@example.com"
            />

            {/* Member 3 */}
            <MemberCard
              name="Name Here"
              // eslint-disable-next-line jsx-a11y/aria-role
              role="Treasurer – OBA"
              phone="+94 XX XXX XXXX"
              email="email@example.com"
            />
          </div>
        </div>
      </section>

      {/* JOIN CTA */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-12 text-center">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
          Join the OBA & Stay Connected to KCC
        </h2>
        <p className="text-sm text-gray-600 mb-4 max-w-xl mx-auto">
          Former students of Kekirawa Central College are warmly invited to register
          with the association and contribute to shaping the school&apos;s future.
        </p>

        <a
          href="/contact"
          className="inline-flex px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#800000] text-white hover:bg-[#650000] transition"
        >
          Contact OBA Secretariat →
        </a>
      </section>
    </div>
  );
}

/* === Reusable component === */
function MemberCard({
  name,
  role,
  phone,
  email,
}: {
  name: string;
  role: string;
  phone: string;
  email: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm flex flex-col items-center text-center">
      {/* Image placeholder or uploaded image */}
      <div className="w-28 h-28 rounded-xl bg-gray-200 border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-500 mb-3 overflow-hidden">
        {/* Replace the DIV with <img src="/images/oba/president.jpg" /> later */}
        + Replace with Image
      </div>

      <p className="font-semibold text-gray-900 text-sm mb-1">{name}</p>
      <p className="text-xs text-gray-600 mb-2">{role}</p>

      <p className="text-xs text-gray-700">
        📞 {phone}
        <br />
        ✉️ {email}
      </p>
    </div>
  );
}
