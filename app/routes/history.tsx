// app/routes/history.tsx
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "History – Kekirawa Central College" },
  {
    name: "description",
    content:
      "The historical journey of Kekirawa Central College from 1945 to the present day — milestones, leadership and transformation into a national school.",
  },
];

export default function HistoryPage() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <p className="text-xs tracking-[0.32em] uppercase text-[#800000] mb-2">
            School History
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            A Legacy Built Through Education
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-3xl">
            Since 1945, Kekirawa Central College has stood as a beacon of learning,
            discipline and character in the North Central Province — a home
            that shaped generations of citizens and leaders.
          </p>
        </div>
      </section>

      {/* HISTORICAL OVERVIEW */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="prose prose-sm md:prose-base max-w-none text-gray-800 space-y-4">
          <p>
            Kekirawa Central College was founded in <strong>1945</strong> under the
            visionary reforms of <strong>Hon. Dr C. W. W. Kannangara</strong>, during
            Sri Lanka’s historic transition to free education. It began as a Buddhist
            mixed school on a vast and peaceful 20-acre site in Kekirawa, with just
            <strong> 31 students and 2 teachers</strong>.
          </p>

          <p>
            Through the following decades, the College became one of the most important
            central schools in the region — not only educating students but uplifting
            the rural community through cultural, academic and sports development.
          </p>

          <p>
            The school’s transformation reached a new milestone in <strong>1993</strong>,
            when it was officially upgraded to <strong>National School status</strong>,
            placing it directly under the Ministry of Education. This recognition came
            as a result of consistent academic performance, strong leadership,
            co-curricular achievements and growing school identity.
          </p>

          <p>
            Today, Kekirawa Central College stands proud as a modern learning institution,
            offering a complete educational journey from Grade 6 to Advanced Level,
            guided by the timeless motto{" "}
            <strong className="text-[#800000]">“Duty First”</strong>.
          </p>
        </div>
      </section>

      {/* PHOTO GALLERY SPOTS (MANUALLY ADD LATER) */}
      <section className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
          Historical photo memories
        </h2>
        <p className="text-xs md:text-sm text-gray-600 mb-4">
          Reserved space for archival photographs of the school from early decades.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {/* Placeholder 1 */}
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-100 h-52 flex items-center justify-center text-xs text-gray-500">
            + Old Photo 1
          </div>

          {/* Placeholder 2 */}
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-100 h-52 flex items-center justify-center text-xs text-gray-500">
            + Old Photo 2
          </div>

          {/* Placeholder 3 */}
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-100 h-52 flex items-center justify-center text-xs text-gray-500">
            + Old Photo 3 (optional)
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-8 text-center">
            Milestones Through the Years
          </h2>

          <ol className="space-y-8 border-l-2 border-gray-300 pl-6">
            <TimelineItem year="1945">
              Establishment of the school under the free education programme with
              31 students and 2 teachers.
            </TimelineItem>

            <TimelineItem year="1950s – 1980s">
              Academic, sports and cultural programs expanded; rise in district-level
              recognition and community involvement.
            </TimelineItem>

            <TimelineItem year="1993">
              Upgraded to a <strong>National School</strong>, strengthening academic
              and administrative standards.
            </TimelineItem>

            <TimelineItem year="2000s – Today">
              Modernisation of infrastructure including ICT labs, science facilities,
              library and digital learning; continued growth in academic and
              co-curricular achievements.
            </TimelineItem>
          </ol>
        </div>
      </section>

      {/* PAST PRINCIPALS */}
<section
  id="past-principals"
  className="bg-white border-y border-gray-200 scroll-mt-20"
>
  <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
    <p className="text-xs tracking-[0.3em] uppercase text-[#800000] mb-1">
      Leadership
    </p>
    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
      Past Principals of Kekirawa Central College
    </h2>
    <p className="text-sm md:text-base text-gray-600 max-w-3xl mb-8">
      The College is shaped by the principals who dedicated their service to
      academic excellence, discipline and the school motto <strong>“Duty First”</strong>.
      This list honours their leadership across the decades.
    </p>

    {/* PRINCIPALS GRID */}
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-sm">

      {/* Principal 1 */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center mb-3">
          {/* Replace src with actual image path e.g. /images/principals/banneheka.jpg */}
          <img
            src="/images/principals/principal-1.webp"
            alt="G.B. Banneheka"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
        <p className="font-semibold text-gray-900 text-sm mb-1">G.B. Banneheka</p>
        <p className="text-xs text-gray-600">1945 - 1946</p>
      </div>

      {/* Principal 2 */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center mb-3">
          <img
            src="/images/principals/principal-2.webp"
            alt="W.M.M. Weerasinghe"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
        <p className="font-semibold text-gray-900 text-sm mb-1">W.M.M. Weerasinghe</p>
        <p className="text-xs text-gray-600">1955 - 1956</p>
      </div>

      {/* Principal 3 */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center mb-3">
          <img
            src="/images/principals/principal-3.webp"
            alt="A.G.O.H. Perera"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
        <p className="font-semibold text-gray-900 text-sm mb-1">A.G.O.H. Perera</p>
        <p className="text-xs text-gray-600">1958 - 1962 | 1965 - 1967</p>
      </div>

      {/* Principal 4 */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center mb-3">
          <img
            src="/images/principals/principal-4.webp"
            alt="H.B. Weerakoon"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
        <p className="font-semibold text-gray-900 text-sm mb-1">H.B. Weerakoon</p>
        <p className="text-xs text-gray-600">1962-1965</p>
      </div>

        {/* Principal 5 */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center mb-3">
          <img
            src="/images/principals/principal-5.webp"
            alt="S. Pandithasekara"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
        <p className="font-semibold text-gray-900 text-sm mb-1">S. Pandithasekara</p>
        <p className="text-xs text-gray-600">1967 - 1969</p>
      </div>

        {/* Principal 6 */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center mb-3">
          <img
            src="/images/principals/principal-6.webp"
            alt="D.B. Ilangasinghe"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
        <p className="font-semibold text-gray-900 text-sm mb-1">D.B. Ilangasinghe</p>
        <p className="text-xs text-gray-600">1979 - 1984</p>
      </div>

    {/* Principal 7 */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center mb-3">
          <img
            src="/images/principals/principal-7.webp"
            alt="J.J. Kandambe"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
        <p className="font-semibold text-gray-900 text-sm mb-1">J.J. Kandambe</p>
        <p className="text-xs text-gray-600">1984 - 1988</p>
      </div>

        {/* Principal 8 */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center mb-3">
          <img
            src="/images/principals/principal-8.webp"
            alt="D.D. Weerathunga"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
        <p className="font-semibold text-gray-900 text-sm mb-1">D.D. Weerathunga</p>
        <p className="text-xs text-gray-600">1989 - 1990</p>
      </div>

    {/* Principal 9 */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center mb-3">
          <img
            src="/images/principals/principal-9.webp"
            alt="K.M.H. Bandara"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
        <p className="font-semibold text-gray-900 text-sm mb-1">K.M.H. Bandara</p>
        <p className="text-xs text-gray-600">1990 - 1997</p>
      </div>

          {/* Principal 10 */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center mb-3">
          <img
            src="/images/principals/principal-10.webp"
            alt="W.M. Samarasinghe"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
        <p className="font-semibold text-gray-900 text-sm mb-1">W.M. Samarasinghe</p>
        <p className="text-xs text-gray-600">1997 - 1999</p>
      </div>

    {/* Principal 11 */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center mb-3">
          <img
            src="/images/principals/principal-11.webp"
            alt="S.J.P. Wijesinghe"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
        <p className="font-semibold text-gray-900 text-sm mb-1">S.J.P. Wijesinghe</p>
        <p className="text-xs text-gray-600">1999 - 2001</p>
      </div>

    {/* Principal 12 */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center mb-3">
          <img
            src="/images/principals/principal-12.webp"
            alt="A. Abeysundara"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
        <p className="font-semibold text-gray-900 text-sm mb-1">A. Abeysundara</p>
        <p className="text-xs text-gray-600">2002 - 2008</p>
      </div>

      {/* Copy-paste this block and edit for new principals */}
    </div>
  </div>
</section>

    </div>
  );
}

/* Timeline sub-component */
function TimelineItem({
  year,
  children,
}: {
  year: string;
  children: React.ReactNode;
}) {
  return (
    <li className="relative pl-4">
      <span className="absolute -left-[11px] top-1 h-3 w-3 rounded-full bg-[#800000]" />
      <p className="font-semibold text-gray-900 mb-1">{year}</p>
      <p className="text-sm text-gray-700">{children}</p>
    </li>
  );
}
