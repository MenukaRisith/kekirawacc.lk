// app/routes/about.tsx
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "About – Kekirawa Central College" },
  {
    name: "description",
    content:
      "Learn about the history, vision and identity of Kekirawa Central College – the first central college in the North Central Province, founded in 1945 under Sri Lanka’s free education reforms.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#800000] mb-2">
            About
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            Kekirawa Central College
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl">
            Founded in 1945 under Sri Lanka&apos;s free education reforms,
            Kekirawa Central College has grown from a small Buddhist mixed
            school into a leading national school that serves students from
            across the Kekirawa region and beyond.
          </p>
        </div>
      </section>

      {/* STORY + TIMELINE */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14 grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        {/* Our story */}
        <div>
          <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
            Our story
          </h2>
          <div className="space-y-3 text-sm md:text-base text-gray-700">
            <p>
              Kekirawa Central College was established in 1945 as part of the
              historic free education programme led by Hon. Dr C. W. W.
              Kannangara. The school began on a 20-acre site in Kekirawa with a
              small community of around 31 students and 2 teachers, offering
              learning opportunities to village children who had limited access
              to quality education at the time.
            </p>
            <p>
              From these humble beginnings, the College steadily expanded its
              academic and co-curricular programmes. It became the{" "}
              <span className="font-semibold">
                first central college in the North Central Province
              </span>
              , opening a pathway for generations of students to pursue higher
              studies and professional life.
            </p>
            <p>
              In 1993, Kekirawa Central College was upgraded to a{" "}
              <span className="font-semibold">national school</span>, bringing
              it directly under the Ministry of Education and recognising its
              contribution to education in the region. Today, the College
              continues to uphold its motto{" "}
              <span className="font-semibold text-[#800000]">
                &quot;Duty First&quot;
              </span>{" "}
              by nurturing students who are academically capable, disciplined
              and socially responsible.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <aside className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 md:p-5 text-sm text-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Timeline at a glance
          </h3>
          <ol className="space-y-3 text-xs md:text-sm">
            <li className="flex items-start gap-3">
              <div className="mt-[3px] h-2 w-2 rounded-full bg-[#800000]" />
              <div>
                <p className="font-semibold text-gray-900">1945</p>
                <p className="text-gray-700">
                  School founded under free education reforms as a Buddhist
                  mixed school, initially with 31 students and 2 teachers.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-[3px] h-2 w-2 rounded-full bg-[#FACC15]" />
              <div>
                <p className="font-semibold text-gray-900">1940s–1980s</p>
                <p className="text-gray-700">
                  Development as a key central college in the region, expanding
                  academic streams and co-curricular activities.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-[3px] h-2 w-2 rounded-full bg-[#800000]" />
              <div>
                <p className="font-semibold text-gray-900">1993</p>
                <p className="text-gray-700">
                  Upgraded to national school status, under the Ministry of
                  Education.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-[3px] h-2 w-2 rounded-full bg-gray-400" />
              <div>
                <p className="font-semibold text-gray-900">Today</p>
                <p className="text-gray-700">
                  A modern national school in the North Central Province,
                  serving students from Grade 6–13 with a focus on academics,
                  technology, sports and character development.
                </p>
              </div>
            </li>
          </ol>
        </aside>
      </section>

      {/* MISSION / VISION / VALUES */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="mb-8 text-center">
            <p className="text-xs tracking-[0.3em] uppercase text-[#800000] mb-2">
              Our Direction
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              Vision, mission & core values
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
              While formal statements may be updated from time to time, the
              spirit of &quot;Duty First&quot; guides every decision, classroom
              and activity at Kekirawa Central College.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 md:p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Our vision
              </h3>
              <p className="text-xs md:text-sm text-gray-700">
                To be a leading national school that produces well-balanced
                citizens who are knowledgeable, disciplined, innovative and
                ready to serve the nation.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 md:p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Our mission
              </h3>
              <p className="text-xs md:text-sm text-gray-700">
                To create an excellent Sri Lankan for the global village by
                mastering technological literacy and soft skills while achieving
                national education goals.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 md:p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Our core values
              </h3>
              <ul className="list-disc pl-4 text-xs md:text-sm text-gray-700 space-y-1">
                <li>Discipline and responsibility</li>
                <li>Respect for teachers, peers and community</li>
                <li>Integrity and honesty in all actions</li>
                <li>Commitment to learning and hard work</li>
                <li>Service to the nation and society</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SCHOOL IDENTITY / QUICK FACTS */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="mb-6">
          <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
            School identity & quick facts
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl">
            Kekirawa Central College is located along the Talawa Road in
            Kekirawa, within the Anuradhapura District of the North Central
            Province. Over the decades, the College has remained closely
            connected to the surrounding community.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <FactCard label="School type" value="National school" />
          <FactCard
            label="Province / district"
            value="North Central Province · Anuradhapura District"
          />
          <FactCard label="Location" value="Kekirawa, Talawa Road" />
          <FactCard label="Grades" value="Grade 6 – 13" />
          <FactCard
            label="Medium"
            value="Primarily Sinhala, with English for selected subjects/streams"
          />
          <FactCard label="School motto" value="“Duty First”" highlight />
        </div>
      </section>

      {/* FACILITIES */}
      <section
        id="facilities"
        className="bg-white border-y border-gray-200 scroll-mt-20"
      >
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#800000] mb-1">
                Facilities
              </p>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                Learning spaces & infrastructure
              </h2>
              <p className="mt-2 text-sm md:text-base text-gray-600 max-w-2xl">
                The College provides a range of facilities that support classroom
                learning, practical work, sports and co-curricular activities,
                helping students experience a complete school life.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 text-sm">
            <FacilityCard
              title="ICT laboratories"
              description="Dedicated ICT labs with networked computers support ICT lessons, programming, digital design and project work guided by the ICT staff and KCCICTS initiatives."
              imageSrc="/images/facilities/ict-lab.webp"
              imageAlt="Students using computers in an ICT laboratory"
            />
            <FacilityCard
              title="Science laboratories"
              description="Separate laboratories for Science and Advanced Level subjects enable experiments, practical demonstrations and investigation-based learning."
              imageSrc="/images/facilities/science-lab.webp"
              imageAlt="Science laboratory with equipment and students"
            />
            <FacilityCard
              title="Library & reading spaces"
              description="A growing collection of textbooks, reference materials and reading books encourages self-study, research and a reading culture among students."
              imageSrc="/images/facilities/library.webp"
              imageAlt="Students reading in the school library"
            />
            <FacilityCard
              title="Main hall & stage"
              description="Used for assemblies, prize-givings, seminars, cultural events and club programs, providing a central venue for the school community."
              imageSrc="/images/facilities/main-hall.webp"
              imageAlt="Interior view of the school main hall and stage"
            />
            <FacilityCard
              title="Playgrounds & sports areas"
              description="Open grounds and courts support athletics, cricket, volleyball and other sports, helping students develop fitness, teamwork and school spirit."
              imageSrc="/images/facilities/playground.webp"
              imageAlt="Students practising on the school playground"
            />
            <FacilityCard
              title="Special sections & learning zones"
              description="Facilities for Mahaweli Kalapaya, aesthetic subjects and co-curricular activities give students dedicated spaces to explore talents and leadership."
              imageSrc="/images/facilities/mahaweli-section.webp"
              imageAlt="Section of the school dedicated to Mahaweli Kalapaya"
            />
          </div>
        </div>
      </section>

      {/* SCHOOL ANTHEM */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]">
          {/* Anthem text */}
          <div>
            <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
              School anthem (විද්‍යාල ගීය)
            </h2>

            <div className="rounded-2xl border text-center border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-xs md:text-sm text-gray-700 whitespace-pre-line min-h-[120px]">
              මැදි විදුහල් මාතා<br></br>
              නමදිමු බැතියෙන අප සැමදා<br></br>
              මැදි විදුහල් මාතා<br></br>
              <br></br>
              සිප්සත නිරතුරු සිසුහට දෙවනා<br></br>
              මොහදුර පරලා යහමග සදනා<br></br>
              කැකිරා මැදි විදුහල් මාතා<br></br>
              මැදි විදුහල් මාතා...<br></br>
              <br></br>
              මනහර කෙත්වතු හා පියකරු වැව්<br></br>
              හෙළ රජ විරුවන් තැනු බිතු සිතුවම්<br></br>
              සිසිලස හමනා සැම සත සනහා<br></br>
              මැදි විදුහල් මාතා...<br></br>
              <br></br>
              ඉද ඔබ සෙවනේ සිසු අප තුටිනේ<br></br>
              සනසමු සිරිලක ලබමින ඥානේ <br></br>
              දින දින සව්සිරි විදිමින සැරදේ <br></br>
              මැදි විදුහල් මාතා...
            </div>
          </div>

          {/* Audio player */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Listen to the anthem
            </h3>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-5">
              <audio
                controls
                className="w-full"
                src="/media/anthem.mp3"
              >
                <track
                  kind="captions"
                  src="/media/anthem.vtt"
                  label="School anthem lyrics (Sinhala)"
                  srcLang="si"
                />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* === Small helper components === */

function FactCard(props: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const { label, value, highlight } = props;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-1">
        {label}
      </p>
      <p
        className={`text-sm font-semibold ${
          highlight ? "text-[#800000]" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FacilityCard(props: {
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
}) {
  const { title, description, imageSrc, imageAlt } = props;
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm flex flex-col">
      {imageSrc && (
        <div className="w-full aspect-[4/3] bg-gray-200">
          <img
            src={imageSrc}
            alt={imageAlt || title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="px-4 py-4 space-y-1.5">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs md:text-sm text-gray-700">
          {description}
        </p>
      </div>
    </div>
  );
}
