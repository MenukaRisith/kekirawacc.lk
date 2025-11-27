import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "Sports – Kekirawa Central College" },
  {
    name: "description",
    content:
      "Explore sports at Kekirawa Central College — house system, athletics, cricket, volleyball and co-curricular achievements.",
  },
];

export default function SportsPage() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12 text-center">
          <p className="text-xs tracking-[0.32em] uppercase text-[#800000] mb-2">
            Sports & Fitness
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            Strength · Discipline · Team Spirit
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto">
            Sports play an important role in student life at Kekirawa Central College,
            teaching discipline, teamwork and responsibility while nurturing strong
            athletic talent for the nation.
          </p>
        </div>
      </section>

      {/* HOUSE SYSTEM */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
          House system
        </h2>
        <p className="text-sm md:text-base text-gray-700 mb-6 max-w-3xl">
          Every student is placed into one of four houses from Grade 6 onwards.
          The house system builds identity and teamwork while encouraging
          participation in inter-house sports and events throughout the year.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <HouseCard name="Anura" color="bg-[#F9A825]" />
          <HouseCard name="Kelani" color="bg-[#4CAF50]" />
          <HouseCard name="Thissara" color="bg-[#C62828]" />
          <HouseCard name="Vijitha" color="bg-[#283593]" />
        </div>
      </section>

      {/* MAIN SPORTS */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="mb-6 text-center">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              Sports offered at KCC
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-2 max-w-3xl mx-auto">
              Students can compete in a variety of sports at school, zonal, provincial
              and national levels.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 text-sm">
            <SportCard title="Athletics" />
            <SportCard title="Cricket" />
            <SportCard title="Volleyball" />
            <SportCard title="Elle & Baseball" />
            <SportCard title="Chess" />
            <SportCard title="Badminton" />
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Achievements & Highlights
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto mt-2">
            The College continues to excel in zonal and provincial sports meets,
            proudly representing the North Central Province.
          </p>
        </div>

        <ul className="text-sm text-gray-700 space-y-3 max-w-3xl mx-auto">
          <li>🏅 Consistent finalist placements in Zonal Athletics Championships</li>
          <li>🏆 Volleyball and cricket teams competing at provincial level</li>
          <li>🥇 Individual athletes qualifying for national events in track & field</li>
          <li>📣 Annual inter-house sports meet fostering discipline and sportsmanship</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 text-center">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            Support and celebrate student athletes
          </h2>
          <p className="text-sm text-gray-600 mb-4 max-w-xl mx-auto">
            Sporting events are open to parents, Old Boys and well-wishers.
          </p>
          <a
            href="/contact"
            className="inline-flex px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#800000] text-white hover:bg-[#650000] transition"
          >
            Contact the Sports Division →
          </a>
        </div>
      </section>
    </div>
  );
}

/* === Small components === */
function HouseCard({ name, color }: { name: string; color: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 py-6 px-4 shadow-sm text-center">
      <div
        className={`w-12 h-12 rounded-full mx-auto mb-3 border-2 border-white shadow ${color}`}
      ></div>
      <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
    </div>
  );
}

function SportCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    </div>
  );
}
