// app/routes/admin.alumni.$id.edit.tsx
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { pool } from "~/utils/db.server";
import {
  requireUserWithRole,
  type AuthUser,
} from "~/utils/auth.server";
import { AdminLayout } from "~/components/admin/AdminLayout";

export const meta: MetaFunction = () => [
  { title: "Edit Alumni Profile – KCC Admin" },
];

type AlumniRow = {
  id: number;
  name: string;
  slug: string;
  gradYear: number | null;
  photoUrl: string | null;
  headline: string | null;
  bio: string | null;
  achievements: string | null;
  isFeatured: 0 | 1;
  category: string | null;
};

type NewsListRow = {
  id: number;
  title: string;
  slug: string;
  publishedAt: string;
};

type LoaderData = {
  user: AuthUser;
  alumni: AlumniRow;
  relatedNews: NewsListRow[];
  relatedNewsCount: number;
};

// Same categories as in admin.alumni.new.tsx
const ALUMNI_CATEGORIES = [
  "",
  "Education",
  "Military",
  "Political / Public Service",
  "Business & Entrepreneurship",
  "Arts & Culture",
  "Sports",
  "Science & Technology",
  "Other",
] as const;

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUserWithRole(request, ["ADMIN"]);

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) {
    throw redirect("/admin/alumni");
  }

  // Fetch alumni row (now includes category)
  const [alumniRowsRaw] = await pool.query(
    `
      SELECT
        id,
        name,
        slug,
        gradYear,
        photoUrl,
        headline,
        bio,
        achievements,
        isFeatured,
        category
      FROM Alumni
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );
  const alumniRows = alumniRowsRaw as AlumniRow[];

  if (!alumniRows || alumniRows.length === 0) {
    throw redirect("/admin/alumni");
  }

  const alumni = alumniRows[0];

  // Optional: count related published news (if you have an alumniId column on NewsPost)
  const [countRowsRaw] = await pool.query(
    `
      SELECT COUNT(*) AS count
      FROM NewsPost
      WHERE status = 'PUBLISHED'
        AND publishedAt IS NOT NULL
        AND alumniId = ?
    `,
    [id]
  );
  const countRows = countRowsRaw as Array<{ count: number }>;
  const relatedNewsCount = countRows[0]?.count ?? 0;

  // Optional: latest related news items
  const [newsRowsRaw] = await pool.query(
    `
      SELECT id, title, slug, publishedAt
      FROM NewsPost
      WHERE status = 'PUBLISHED'
        AND publishedAt IS NOT NULL
        AND alumniId = ?
      ORDER BY publishedAt DESC
      LIMIT 5
    `,
    [id]
  );
  const relatedNews = newsRowsRaw as NewsListRow[];

  return json<LoaderData>({
    user,
    alumni,
    relatedNews,
    relatedNewsCount,
  });
};

type ActionData = {
  fieldErrors?: {
    name?: string;
    slug?: string;
  };
  formError?: string;
  fields?: {
    name: string;
    slug: string;
    gradYear: string;
    photoUrl: string;
    headline: string;
    bio: string;
    achievements: string;
    isFeatured: string;
    category: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserWithRole(request, ["ADMIN"]);

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) {
    return redirect("/admin/alumni");
  }

  const formData = await request.formData();

  const name = (formData.get("name") || "").toString().trim();
  let slug = (formData.get("slug") || "").toString().trim();
  const gradYearRaw = (formData.get("gradYear") || "").toString().trim();
  const photoUrl = (formData.get("photoUrl") || "").toString().trim();
  const headline = (formData.get("headline") || "").toString().trim();
  const bio = (formData.get("bio") || "").toString().trim();
  const achievements = (formData.get("achievements") || "")
    .toString()
    .trim();
  const isFeaturedRaw = (formData.get("isFeatured") || "off").toString();
  const categoryRaw = (formData.get("category") || "").toString().trim();

  if (!slug && name) {
    slug = slugify(name);
  }

  const gradYear =
    gradYearRaw && gradYearRaw.length > 0 ? Number(gradYearRaw) : null;
  const isFeatured = isFeaturedRaw === "on" ? 1 : 0;
  const category = categoryRaw.length > 0 ? categoryRaw : "";

  const fieldErrors: ActionData["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Name is required";
  if (!slug) fieldErrors.slug = "Slug is required";

  if (fieldErrors.name || fieldErrors.slug) {
    return json<ActionData>(
      {
        fieldErrors,
        fields: {
          name,
          slug,
          gradYear: gradYearRaw,
          photoUrl,
          headline,
          bio,
          achievements,
          isFeatured: isFeaturedRaw,
          category,
        },
      },
      { status: 400 }
    );
  }

  try {
    await pool.query(
      `
        UPDATE Alumni
        SET
          name = ?,
          slug = ?,
          gradYear = ?,
          photoUrl = ?,
          headline = ?,
          bio = ?,
          achievements = ?,
          isFeatured = ?,
          category = ?
        WHERE id = ?
      `,
      [
        name,
        slug,
        gradYear,
        photoUrl || null,
        headline || null,
        bio || null,
        achievements || null,
        isFeatured,
        category || null,
        id,
      ]
    );
  } catch (err: unknown) {
    console.error("Error updating alumni profile:", err);
    const error = err as { code?: string };
    const message =
      error.code === "ER_DUP_ENTRY"
        ? "Slug already exists. Please choose another one."
        : "Something went wrong while saving the alumni profile.";
    return json<ActionData>(
      {
        formError: message,
        fields: {
          name,
          slug,
          gradYear: gradYearRaw,
          photoUrl,
          headline,
          bio,
          achievements,
          isFeatured: isFeaturedRaw,
          category,
        },
      },
      { status: 500 }
    );
  }

  return redirect("/admin/alumni");
};

/* ===== Page component ===== */

export default function AdminAlumniEditPage() {
  const { user, alumni, relatedNews, relatedNewsCount } =
    useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const defaultName = actionData?.fields?.name ?? alumni.name;
  const defaultSlug = actionData?.fields?.slug ?? alumni.slug;
  const defaultGradYear =
    actionData?.fields?.gradYear ??
    (alumni.gradYear ? String(alumni.gradYear) : "");
  const defaultPhotoUrl =
    actionData?.fields?.photoUrl ?? alumni.photoUrl ?? "";
  const defaultHeadline =
    actionData?.fields?.headline ?? alumni.headline ?? "";
  const defaultBio = actionData?.fields?.bio ?? alumni.bio ?? "";
  const defaultAchievements =
    actionData?.fields?.achievements ?? alumni.achievements ?? "";
  const defaultIsFeatured =
    actionData?.fields?.isFeatured === "on" || alumni.isFeatured === 1;
  const defaultCategory =
    actionData?.fields?.category ?? alumni.category ?? "";

  return (
    <AdminLayout user={user} title="Edit alumni profile">
      <div className="max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Edit: {alumni.name}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Update this notable alumni&apos;s profile, details and visibility.
            </p>
          </div>
          {alumni.slug && (
            <a
              href={`/alumni#${alumni.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-gray-300 px-4 py-1.5 text-[11px] font-medium text-gray-700 hover:border-[#800000] hover:text-[#800000] transition bg-white"
            >
              View on alumni page ↗
            </a>
          )}
        </div>

        {actionData?.formError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {actionData.formError}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Main form */}
          <Form method="post" className="space-y-5">
            {/* Name */}
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-xs font-medium text-gray-700"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={defaultName}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
                required
              />
              {actionData?.fieldErrors?.name && (
                <p className="text-[11px] text-red-600 mt-1">
                  {actionData.fieldErrors.name}
                </p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <label
                htmlFor="slug"
                className="block text-xs font-medium text-gray-700"
              >
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                defaultValue={defaultSlug}
                placeholder="auto-generated-from-name if left blank"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              />
              {actionData?.fieldErrors?.slug && (
                <p className="text-[11px] text-red-600 mt-1">
                  {actionData.fieldErrors.slug}
                </p>
              )}
              <p className="text-[11px] text-gray-500">
                Used for internal reference or anchor links on the alumni page.
              </p>
            </div>

            {/* Grad year */}
            <div className="space-y-1">
              <label
                htmlFor="gradYear"
                className="block text-xs font-medium text-gray-700"
              >
                Graduation year
              </label>
              <input
                id="gradYear"
                name="gradYear"
                type="number"
                defaultValue={defaultGradYear}
                placeholder="e.g. 2008"
                className="block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label
                htmlFor="category"
                className="block text-xs font-medium text-gray-700"
              >
                Alumni category
              </label>
              <select
                id="category"
                name="category"
                defaultValue={defaultCategory}
                className="block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              >
                {ALUMNI_CATEGORIES.map((cat) => (
                  <option key={cat || "none"} value={cat}>
                    {cat || "— Select category (optional) —"}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500">
                Optional grouping such as Military, Education, Political / Public
                Service, Business, Arts, Sports, etc.
              </p>
            </div>

            {/* Photo */}
            <div className="space-y-1">
              <label
                htmlFor="photoUrl"
                className="block text-xs font-medium text-gray-700"
              >
                Photo URL
              </label>
              <input
                id="photoUrl"
                name="photoUrl"
                type="text"
                defaultValue={defaultPhotoUrl}
                placeholder="https://…"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              />
              <p className="text-[11px] text-gray-500">
                Optional. Displayed with the alumni profile.
              </p>
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <label
                htmlFor="headline"
                className="block text-xs font-medium text-gray-700"
              >
                Headline / role now
              </label>
              <input
                id="headline"
                name="headline"
                type="text"
                defaultValue={defaultHeadline}
                placeholder="e.g. Senior Software Engineer, Research Scientist"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label
                htmlFor="bio"
                className="block text-xs font-medium text-gray-700"
              >
                Short bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={defaultBio}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
                placeholder="A short story of their journey, contributions, and impact."
              />
            </div>

            {/* Achievements */}
            <div className="space-y-1">
              <label
                htmlFor="achievements"
                className="block text-xs font-medium text-gray-700"
              >
                Key achievements
              </label>
              <textarea
                id="achievements"
                name="achievements"
                rows={4}
                defaultValue={defaultAchievements}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
                placeholder="Optional. You can list awards, positions, or notable work."
              />
            </div>

            {/* Featured toggle */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">
                Featured on top
              </p>
              <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  name="isFeatured"
                  defaultChecked={defaultIsFeatured}
                  className="h-4 w-4 text-[#800000] border-gray-300"
                />
                <span>
                  Highlight this alumni at the top of the alumni section.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-full bg-[#800000] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#650000] disabled:opacity-70 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? "Saving…" : "Save changes"}
              </button>
            </div>
          </Form>

          {/* Side panel: quick preview / related news */}
          <aside className="space-y-4">
            {defaultPhotoUrl && (
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <p className="text-[11px] font-semibold text-gray-700 mb-2">
                  Profile photo preview
                </p>
                <div className="aspect-[4/5] w-40 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={defaultPhotoUrl}
                    alt={defaultName}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="text-[11px] font-semibold text-gray-700 mb-2">
                Related news
              </p>
              {relatedNewsCount === 0 ? (
                <p className="text-[11px] text-gray-500">
                  No published news posts linked to this alumni yet.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-500">
                    {relatedNewsCount} published post
                    {relatedNewsCount === 1 ? "" : "s"} linked.
                  </p>
                  <ul className="space-y-1.5">
                    {relatedNews.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`/news/${item.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#800000] hover:underline font-medium"
                        >
                          {item.title}
                        </a>
                        <div className="text-[10px] text-gray-500">
                          {new Date(item.publishedAt).toLocaleDateString(
                            "en-LK",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ===== Helper ===== */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 190);
}
