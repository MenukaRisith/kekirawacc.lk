// app/routes/admin.alumni.new.tsx
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
import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "~/utils/db.server";
import {
  requireUserWithRole,
  type AuthUser,
} from "~/utils/auth.server";
import { AdminLayout } from "~/components/admin/AdminLayout";

export const meta: MetaFunction = () => [
  { title: "New Alumni Profile – KCC Admin" },
];

type LoaderData = {
  user: AuthUser;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserWithRole(request, ["ADMIN"]);
  return json<LoaderData>({ user });
};

// Optional: for UI dropdown; values are stored as string in DB
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

export const action: ActionFunction = async ({ request }) => {
  // Only need to ensure the user is ADMIN; value is not used
  await requireUserWithRole(request, ["ADMIN"]);

  const formData = await request.formData();

  const name = (formData.get("name") || "").toString().trim();
  let slug = (formData.get("slug") || "").toString().trim();
  const gradYearRaw = (formData.get("gradYear") || "").toString().trim();
  const photoUrlText = (formData.get("photoUrl") || "").toString().trim();
  const photoFile = formData.get("photo") ?? null;
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
          photoUrl: photoUrlText,
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

  // Determine final photo URL:
  // - If a new file is uploaded, save it and use that URL
  // - Else, use the text URL (may be empty)
  let finalPhotoUrl = photoUrlText;
  if (isFile(photoFile) && photoFile.size > 0) {
    finalPhotoUrl = await saveAlumniPhoto(photoFile, name);
  }

  try {
    await pool.query(
      `
        INSERT INTO Alumni
          (name, slug, gradYear, photoUrl, headline, bio, achievements, isFeatured, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        slug,
        gradYear,
        finalPhotoUrl || null,
        headline || null,
        bio || null,
        achievements || null,
        isFeatured,
        category || null,
      ]
    );
  } catch (err: unknown) {
    console.error("Error creating alumni profile:", err);
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
          photoUrl: finalPhotoUrl,
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

export default function AdminAlumniNewPage() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const defaultName = actionData?.fields?.name || "";
  const defaultSlug = actionData?.fields?.slug || "";
  const defaultGradYear = actionData?.fields?.gradYear || "";
  const defaultPhotoUrl = actionData?.fields?.photoUrl || "";
  const defaultHeadline = actionData?.fields?.headline || "";
  const defaultBio = actionData?.fields?.bio || "";
  const defaultAchievements = actionData?.fields?.achievements || "";
  const defaultIsFeatured = actionData?.fields?.isFeatured === "on";
  const defaultCategory = actionData?.fields?.category || "";

  return (
    <AdminLayout user={user} title="New alumni profile">
      <div className="max-w-3xl">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Add notable alumni
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          Create a profile for past students who have made notable contributions.
        </p>

        {actionData?.formError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {actionData.formError}
          </div>
        )}

        <Form
          method="post"
          encType="multipart/form-data"
          className="space-y-5"
        >
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
              Optional grouping such as Military, Education, Political / Public Service, Business, Arts, Sports, etc.
            </p>
          </div>

          {/* Photo URL + upload */}
          <div className="space-y-2">
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
                You can either paste an image URL or upload a file below.
              </p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="photo"
                className="block text-xs font-medium text-gray-700"
              >
                Upload photo
              </label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                className="block w-full text-xs text-gray-700"
              />
              <p className="text-[11px] text-gray-500">
                If you upload a photo, it will be saved on the server and used
                for this profile.
              </p>
            </div>
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
            <span className="block text-xs font-medium text-gray-700">
              Featured on top
            </span>
            <div className="flex items-start gap-2">
              <input
                id="isFeatured"
                type="checkbox"
                name="isFeatured"
                defaultChecked={defaultIsFeatured}
                className="h-4 w-4 mt-0.5 text-[#800000] border-gray-300"
              />
              <label
                htmlFor="isFeatured"
                className="text-xs text-gray-700"
              >
                Highlight this alumni at the top of the alumni section.
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-full bg-[#800000] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#650000] disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Saving…" : "Save profile"}
            </button>
          </div>
        </Form>
      </div>
    </AdminLayout>
  );
}

/* ===== Helpers ===== */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 190);
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value;
}

async function saveAlumniPhoto(file: File, name: string): Promise<string> {
  const safeBase = slugify(name) || "alumni";
  const publicDir = path.join(process.cwd(), "public");
  const uploadDir = path.join(publicDir, "alumni");

  await fs.mkdir(uploadDir, { recursive: true });

  const originalName = file.name || "photo.png";
  const ext = path.extname(originalName) || ".png";
  const fileName = `${safeBase}-${Date.now()}${ext.toLowerCase()}`;
  const filePath = path.join(uploadDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  // URL served from /public
  return `/alumni/${fileName}`;
}
