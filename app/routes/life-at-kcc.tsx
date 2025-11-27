// app/routes/life-at-kcc.tsx
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => [
  { title: "Life at KCC – Kekirawa Central College" },
  {
    name: "description",
    content:
      "Discover student life at Kekirawa Central College – academics, clubs & societies, sports, leadership, ICT labs and co-curricular activities.",
  },
];

export default function LifeAtKCCPage() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#800000] mb-2">
            Life at KCC
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            Learn, Lead and Compete
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto">
            As a mixed national school, Kekirawa Central College offers a full
            journey from Grade 6 to GCE O/L and A/L — balancing studies with
            clubs, aesthetic activities, leadership and sports.
          </p>
        </div>
      </section>

      {/* TIMELINE STYLE SECTIONS */}
{/* TIMELINE STYLE SECTIONS */}
<section className="bg-gray-50">
  <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
    <div className="relative">
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#FACC15] via-gray-300 to-[#FACC15]/70" />

      <LifeBlock
        align="left"
        eyebrow="Academics"
        title="Strong Foundations in Learning"
        text="Academic life at KCC spans from Grade 6 to GCE O/L and A/L, with students guided through solid foundations in Mathematics, Science, Languages and Commerce. As a 1AB national school, KCC prepares learners for advanced study through Arts, Commerce, Tech and Science streams at Advanced Level."
        linkTo="/academics"
        linkLabel="Discover academics"
        imageSrc="/images/life/academics.webp"
        imageAlt="Teacher guiding students at the board"
      />

      <LifeBlock
        align="right"
        eyebrow="Clubs & Societies"
        title="Spaces to Explore Talents"
        text="ICT, Science, Aesthetic, Language and service-oriented societies give students the chance to organise events, compete, volunteer and discover new interests. Committees and student organisers learn planning, teamwork and public communication."
        linkTo="/clubs"
        linkLabel="Explore clubs & societies"
        imageSrc="/images/life/clubs.webp"
        imageAlt="Students engaged in a club activity"
      />

      <LifeBlock
        align="left"
        eyebrow="Sports & Games"
        title="Carrying the Colours with Pride"
        text="From athletics and cricket to volleyball and other field events, sports at KCC focus on fitness, discipline and team spirit. Students represent their houses and the College at provincial and national meets, learning to compete with character."
        linkTo="/sports"
        linkLabel="See sports at KCC"
        imageSrc="/images/life/sports.webp"
        imageAlt="Student in a sports event"
      />

      <LifeBlock
        align="left"
        eyebrow="Leadership"
        title="Prefects, Committees & Student Voice"
        text="The Prefects’ Guild, class monitors, club office bearers and event organising teams provide opportunities for students to lead. Through assemblies, projects and mentoring younger students, they practise responsibility and service-oriented leadership."
        linkTo="/about"
        linkLabel="Read about our culture"
        imageSrc="/images/life/leadership.webp"
        imageAlt="Student leaders at an event"
      />

      <LifeBlock
        align="right"
        eyebrow="ICT Labs & Laboratories"
        title="Hands-on Learning with Modern Facilities"
        text="Dedicated ICT laboratories, science labs and a resource-rich library support project work, experiments and research. Students use computers, lab apparatus and digital tools to connect theory with real-world applications."
        linkTo="/about#facilities"
        linkLabel="View our facilities"
        imageSrc="/images/life/labs.webp"
        imageAlt="Students working in the ICT lab"
      />
    </div>
  </div>
</section>

      {/* QUICK LINKS / CTA GRID */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Explore more about student life
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Jump straight to the sections that matter to you as a student or parent.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4 text-sm">
            <QuickLinkCard
              to="/academics"
              title="Academics"
              description="Streams, grades and exam preparation."
            />
            <QuickLinkCard
              to="/clubs"
              title="Clubs & Societies"
              description="Student groups, projects and events."
            />
            <QuickLinkCard
              to="/sports"
              title="Sports"
              description="House system and sports activities."
            />
            <QuickLinkCard
              to="/contact"
              title="Contact & Admissions"
              description="Reach the school for more details."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* === Components === */

type LifeBlockProps = {
  align: "left" | "right";
  eyebrow: string;
  title: string;
  text: string;
  linkTo: string;
  linkLabel: string;
  imageSrc: string;
  imageAlt: string;
};

function LifeBlock({
  align,
  eyebrow,
  title,
  text,
  linkTo,
  linkLabel,
  imageSrc,
  imageAlt,
}: LifeBlockProps) {
  const isLeft = align === "left";

  return (
    <div className="relative grid md:grid-cols-2 gap-10 md:gap-14 items-center py-10 md:py-12">
      {/* vertical tick marker */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-10">
        <div className="h-10 w-[2px] bg-[#FACC15]" />
      </div>

      {/* Text */}
      <div
        className={`${
          isLeft ? "md:col-start-1" : "md:col-start-2"
        } space-y-3 md:space-y-4`}
      >
        <p className="text-[11px] tracking-[0.25em] uppercase text-[#800000]">
          {eyebrow}
        </p>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          {title}
        </h2>
        <p className="text-sm md:text-base text-gray-700">{text}</p>
        <Link
          to={linkTo}
          className="inline-flex text-xs md:text-sm font-semibold text-[#800000] hover:underline"
        >
          {linkLabel} →
        </Link>
      </div>

      {/* Image */}
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

function QuickLinkCard(props: {
  to: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={props.to}
      className="block rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-md transition px-4 py-4 text-left"
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        {props.title}
      </h3>
      <p className="text-xs md:text-sm text-gray-600">{props.description}</p>
    </Link>
  );
}
