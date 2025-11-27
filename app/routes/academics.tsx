import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";


export const meta: MetaFunction = () => [
  { title: "Academics – Kekirawa Central College" },
  {
    name: "description",
    content:
      "Academic programs at Kekirawa Central College, from Grade 6–13 including O/L and A/L streams in Science, Maths, Commerce and Arts.",
  },
];

export default function AcademicsPage() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#800000] mb-2">
            Academics
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            Academic Excellence at Kekirawa Central College
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl">
            We are committed to building well-rounded students with strong academic
            backgrounds. Our curriculum encourages critical thinking, discipline, innovation,
            and lifelong learning from Grade 6 to 13.
          </p>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Our Academic Philosophy</h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            We believe in a balanced approach to education — developing the mind,
            character, leadership and responsibility. Students are encouraged to aim high,
            discover their potential and contribute to society while upholding the motto{" "}
            <span className="font-semibold text-[#800000]">“Duty First”</span>.
          </p>
        </div>
      </section>

      {/* ACADEMIC TIERS */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Academic Structure</h2>

          <div className="grid gap-6 md:grid-cols-3">
            <TierCard
              title="Grades 6 – 9"
              subtitle="Junior Secondary"
              description="Strengthening fundamentals in Maths, Science, Languages, ICT and Social Sciences with a strong focus on discipline and values."
            />
            <TierCard
              title="Grades 10 – 11"
              subtitle="O/L Section"
              description="Preparation for the GCE Ordinary Level exam with academic coaching, seminars, and practical learning sessions."
            />
            <TierCard
              title="Grades 12 – 13"
              subtitle="A/L Section"
              description="Advanced Level studies with subject streams enabling higher education and professional career paths."
            />
          </div>
        </div>
      </section>

      {/* A/L STREAMS */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          A/L Subject Streams
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StreamCard
            stream="Science"
            subjects="Biology · Chemistry · Physics"
            color="from-emerald-500/20 via-emerald-100 to-white"
          />
          <StreamCard
            stream="Mathematics"
            subjects="Combined Maths · Physics · Chemistry"
            color="from-blue-500/20 via-blue-100 to-white"
          />
          <StreamCard
            stream="Commerce"
            subjects="Accounting · Business Studies · Economics"
            color="from-amber-500/20 via-amber-100 to-white"
          />
          <StreamCard
            stream="Arts"
            subjects="Languages · Political Science · Geography · Media"
            color="from-rose-500/20 via-rose-100 to-white"
          />
        <StreamCard
            stream="Tech"
            subjects="ET · SFT · ICT"
            color="from-rose-500/20 via-rose-100 to-white"
          />
        </div>

        <p className="text-xs md:text-sm text-gray-600 mt-4">
          *ICT is offered in both Mathematics and Arts streams depending on subject selection.
        </p>
      </section>

{/* CTA SECTION */}
<section className="bg-[#800000] text-white">
  <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
    <h2 className="text-lg md:text-xl font-semibold mb-4">
      Resources for Students & Parents
    </h2>
    <div className="grid gap-4 md:grid-cols-3 text-sm">
      <Link
        to="/academics/resources/syllabus"
        className="block rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition px-5 py-3 font-medium"
      >
        Syllabus & Term Plans →
      </Link>

      <Link
        to="/academics/timetable"
        className="block rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition px-5 py-3 font-medium"
      >
        Academic Timetable →
      </Link>

      <Link
        to="https://exams.kekirawacc.lk"
        className="block rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition px-5 py-3 font-medium"
      >
        Exams Portal →
      </Link>
    </div>
  </div>
</section>

    </div>
  );
}

/* === Reusable components === */

function TierCard(props: {
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
      <p className="text-xs tracking-[0.2em] uppercase text-[#800000] mb-1">
        {props.subtitle}
      </p>
      <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
        {props.title}
      </h3>
      <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
        {props.description}
      </p>
    </div>
  );
}

function StreamCard(props: {
  stream: string;
  subjects: string;
  color: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-gradient-to-br ${props.color} p-5 shadow-sm`}
    >
      <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">
        {props.stream}
      </h3>
      <p className="text-xs md:text-sm text-gray-700">{props.subjects}</p>
    </div>
  );
}
