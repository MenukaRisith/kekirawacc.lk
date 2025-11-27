// app/routes/admin.clubs.$id.edit.tsx
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
  { title: "Edit Club – KCC Admin" },
];

type ClubRow = {
  id: number;
  name: string;
  slug: string;
  shortName: string | null;
  category: string | null;
  description: string;
  coverImage: string | null;
  logoImage: string | null;
};

type ExistingClubRow = {
  slug: string;
  coverImage: string | null;
  logoImage: string | null;
};

type LoaderData = {
  user: AuthUser;
  club: ClubRow;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUserWithRole(request, ["ADMIN"]);

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) throw redirect("/admin/clubs");

  // 🔧 remove generic here, cast rows instead
  const [rows] = await pool.query(
    `
      SELECT id, name, slug, shortName, category, description, coverImage, logoImage
      FROM Club
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  const clubs = rows as ClubRow[];
  if (!clubs || clubs.length === 0) throw redirect("/admin/clubs");

  const club = clubs[0];
  return json<LoaderData>({ user, club });
};

type ActionData = {
  fieldErrors?: {
    name?: string;
    slug?: string;
    description?: string;
  };
  formError?: string;
  fields?: {
    name: string;
    slug: string;
    shortName: string;
    category: string;
    description: string;
    coverImage: string;
    logoImage: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  // Only need to ensure user is ADMIN – no need to keep the value
  await requireUserWithRole(request, ["ADMIN"]);

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) return redirect("/admin/clubs");

  // Load existing club so we can keep current image paths if no new upload
  // 🔧 remove generic, cast rows
  const [existingRows] = await pool.query(
    `
      SELECT slug, coverImage, logoImage
      FROM Club
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  const existingClubs = existingRows as ExistingClubRow[];

  if (!existingClubs || existingClubs.length === 0) {
    return redirect("/admin/clubs");
  }

  const existing = existingClubs[0];

  const formData = await request.formData();

  const name = (formData.get("name") || "").toString().trim();
  let slug = (formData.get("slug") || "").toString().trim();
  const shortName = (formData.get("shortName") || "").toString().trim();
  const category = (formData.get("category") || "").toString().trim();
  const description = (formData.get("description") || "").toString().trim();

  const coverImageFile = formData.get("coverImage");
  const logoImageFile = formData.get("logoImage");

  if (!slug && name) {
    slug = slugify(name);
  }

  const fieldErrors: ActionData["fieldErrors"] = {};

  if (!name) fieldErrors.name = "Name is required";
  if (!slug) fieldErrors.slug = "Slug is required";
  if (!description) fieldErrors.description = "Description is required";

  if (fieldErrors.name || fieldErrors.slug || fieldErrors.description) {
    return json<ActionData>(
      {
        fieldErrors,
        fields: {
          name,
          slug,
          shortName,
          category,
          description,
          coverImage: existing.coverImage ?? "",
          logoImage: existing.logoImage ?? "",
        },
      },
      { status: 400 }
    );
  }

  // Start from existing image paths
  let coverImagePath = existing.coverImage ?? "";
  let logoImagePath = existing.logoImage ?? "";

  // If new files uploaded, overwrite
  if (isFile(coverImageFile) && coverImageFile.size > 0) {
    coverImagePath = await saveClubImageFile(coverImageFile, slug, "cover");
  }

  if (isFile(logoImageFile) && logoImageFile.size > 0) {
    logoImagePath = await saveClubImageFile(logoImageFile, slug, "logo");
  }

  try {
    await pool.query(
      `
        UPDATE Club
        SET
          name = ?,
          slug = ?,
          shortName = ?,
          category = ?,
          description = ?,
          coverImage = ?,
          logoImage = ?
        WHERE id = ?
      `,
      [
        name,
        slug,
        shortName || null,
        category || null,
        description,
        coverImagePath || null,
        logoImagePath || null,
        id,
      ]
    );
  } catch (err: unknown) {
    console.error("Error updating club:", err);
    const error = err as { code?: string };
    const message =
      error.code === "ER_DUP_ENTRY"
        ? "Slug already exists. Please choose another one."
        : "Something went wrong while saving the club.";
    return json<ActionData>(
      {
        formError: message,
        fields: {
          name,
          slug,
          shortName,
          category,
          description,
          coverImage: coverImagePath,
          logoImage: logoImagePath,
        },
      },
      { status: 500 }
    );
  }

  return redirect("/admin/clubs");
};

/* ===== Page component ===== */

export default function AdminClubsEditPage() {
  const { user, club } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const defaultName = actionData?.fields?.name ?? club.name;
  const defaultSlug = actionData?.fields?.slug ?? club.slug;
  const defaultShortName =
    actionData?.fields?.shortName ?? club.shortName ?? "";
  const defaultCategory =
    actionData?.fields?.category ?? club.category ?? "";
  const defaultDescription =
    actionData?.fields?.description ?? club.description ?? "";

  const currentCoverImage =
    actionData?.fields?.coverImage ?? club.coverImage ?? "";
  const currentLogoImage =
    actionData?.fields?.logoImage ?? club.logoImage ?? "";

  return (
    <AdminLayout user={user} title="Edit club">
      <div className="max-w-3xl">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Edit: {club.name}
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          Update club details and images.
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
              Club name <span className="text-red-500">*</span>
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
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
            />
            {actionData?.fieldErrors?.slug && (
              <p className="text-[11px] text-red-600 mt-1">
                {actionData.fieldErrors.slug}
              </p>
            )}
            <p className="text-[11px] text-gray-500">
              Used in the URL, e.g.{" "}
              <span className="font-mono text-gray-700">
                /clubs/ict-society
              </span>
              .
            </p>
          </div>

          {/* Short name */}
          <div className="space-y-1">
            <label
              htmlFor="shortName"
              className="block text-xs font-medium text-gray-700"
            >
              Short name / abbreviation
            </label>
            <input
              id="shortName"
              name="shortName"
              type="text"
              defaultValue={defaultShortName}
              placeholder="e.g. KCCICTS"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label
              htmlFor="category"
              className="block text-xs font-medium text-gray-700"
            >
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              defaultValue={defaultCategory}
              placeholder="e.g. Academic, Sports, Service, Cultural"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label
              htmlFor="description"
              className="block text-xs font-medium text-gray-700"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={defaultDescription}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              required
            />
            {actionData?.fieldErrors?.description && (
              <p className="text-[11px] text-red-600 mt-1">
                {actionData.fieldErrors.description}
              </p>
            )}
          </div>

          {/* Cover image (file upload) */}
          <div className="space-y-1">
            <label
              htmlFor="coverImage"
              className="block text-xs font-medium text-gray-700"
            >
              Cover image
            </label>

            {currentCoverImage && (
              <div className="mb-2 flex items-center gap-3">
                <div className="h-16 w-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={currentCoverImage}
                    alt="Current cover"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Current:{" "}
                  <span className="font-mono break-all">
                    {currentCoverImage}
                  </span>
                </p>
              </div>
            )}

            <input
              id="coverImage"
              name="coverImage"
              type="file"
              accept="image/*"
              className="block w-full text-xs text-gray-700"
            />
            <p className="text-[11px] text-gray-500">
              Wide image used on the club profile page header.
            </p>
          </div>

          {/* Logo image (file upload) */}
          <div className="space-y-1">
            <label
              htmlFor="logoImage"
              className="block text-xs font-medium text-gray-700"
            >
              Logo image
            </label>

            {currentLogoImage && (
              <div className="mb-2 flex items-center gap-3">
                <div className="h-16 w-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={currentLogoImage}
                    alt="Current logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Current:{" "}
                  <span className="font-mono break-all">
                    {currentLogoImage}
                  </span>
                </p>
              </div>
            )}

            <input
              id="logoImage"
              name="logoImage"
              type="file"
              accept="image/*"
              className="block w-full text-xs text-gray-700"
            />
            <p className="text-[11px] text-gray-500">
              Square image or badge for the club.
            </p>
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

async function saveClubImageFile(
  file: File,
  slug: string,
  kind: "cover" | "logo"
): Promise<string> {
  const safeSlug = slug || "club";
  const publicDir = path.join(process.cwd(), "public");
  const uploadDir = path.join(publicDir, "clubs", safeSlug);

  await fs.mkdir(uploadDir, { recursive: true });

  const originalName = file.name || `${kind}.png`;
  const ext = path.extname(originalName) || ".png";
  const fileName = `${kind}${ext.toLowerCase()}`;
  const filePath = path.join(uploadDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  // URL path served from /public
  return `/clubs/${safeSlug}/${fileName}`;
}
