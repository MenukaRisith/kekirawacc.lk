// app/routes/admin.clubs.new.tsx
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "~/utils/db.server";
import {
  requireUserWithRole,
  type AuthUser,
} from "~/utils/auth.server";
import { AdminLayout } from "~/components/admin/AdminLayout";

export const meta: MetaFunction = () => [
  { title: "New Club – KCC Admin" },
];

type LoaderData = {
  user: AuthUser;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserWithRole(request, ["ADMIN"]);
  return json<LoaderData>({ user });
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
    teachers: string;
    committee: string;
  };
};

type PersonLine = {
  name: string;
  roleTitle: string;
  photoUrl: string | null;
  sortOrder: number;
};

export const action: ActionFunction = async ({ request }) => {
  // Ensure the user is ADMIN; we don't need the value itself.
  await requireUserWithRole(request, ["ADMIN"]);

  const formData = await request.formData();

  const name = (formData.get("name") || "").toString().trim();
  let slug = (formData.get("slug") || "").toString().trim();
  const shortName = (formData.get("shortName") || "").toString().trim();
  const category = (formData.get("category") || "").toString().trim();
  const description = (formData.get("description") || "").toString().trim();

  const teachersRaw = (formData.get("teachers") || "").toString();
  const committeeRaw = (formData.get("committee") || "").toString();

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
          coverImage: "",
          logoImage: "",
          teachers: teachersRaw,
          committee: committeeRaw,
        },
      },
      { status: 400 }
    );
  }

  let coverImagePath = "";
  let logoImagePath = "";

  // Save uploaded images (if any)
  if (isFile(coverImageFile) && coverImageFile.size > 0) {
    coverImagePath = await saveClubImageFile(coverImageFile, slug, "cover");
  }

  if (isFile(logoImageFile) && logoImageFile.size > 0) {
    logoImagePath = await saveClubImageFile(logoImageFile, slug, "logo");
  }

  // Parse teachers & committee into JSON arrays
  const teacherInChargeJson = JSON.stringify(
    parsePersonLines(teachersRaw)
  );
  const committeeMembersJson = JSON.stringify(
    parsePersonLines(committeeRaw)
  );

  try {
    await pool.query(
      `
        INSERT INTO Club
          (name, slug, shortName, category, description, coverImage, logoImage, teacherInChargeJson, committeeMembersJson)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        slug,
        shortName || null,
        category || null,
        description,
        coverImagePath || null,
        logoImagePath || null,
        teacherInChargeJson,
        committeeMembersJson,
      ]
    );
  } catch (err: unknown) {
    console.error("Error creating club:", err);
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
          teachers: teachersRaw,
          committee: committeeRaw,
        },
      },
      { status: 500 }
    );
  }

  return redirect("/admin/clubs");
};

/* ===== Page component ===== */

export default function AdminClubsNewPage() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const defaultName = actionData?.fields?.name || "";
  const defaultSlug = actionData?.fields?.slug || "";
  const defaultShortName = actionData?.fields?.shortName || "";
  const defaultCategory = actionData?.fields?.category || "";
  const defaultDescription = actionData?.fields?.description || "";
  const defaultTeachers = actionData?.fields?.teachers || "";
  const defaultCommittee = actionData?.fields?.committee || "";

  return (
    <AdminLayout user={user} title="New club">
      <div className="max-w-3xl">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Register a new club or society
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          Create an official profile for a club, society or association.
        </p>

        {actionData?.formError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {actionData.formError}
          </div>
        )}

        <Form method="post" encType="multipart/form-data" className="space-y-5">
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
              placeholder="auto-generated-from-name if left blank"
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
              placeholder="Explain the club's purpose, activities, membership, etc."
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

          {/* Teachers-in-charge */}
          <div className="space-y-1">
            <label
              htmlFor="teachers"
              className="block text-xs font-medium text-gray-700"
            >
              Teachers-in-charge
            </label>
            <textarea
              id="teachers"
              name="teachers"
              rows={3}
              defaultValue={defaultTeachers}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              placeholder={`One per line: Name | Role | Photo URL (optional)\nE.g.\nMr. S. Perera | Teacher-in-charge | https://example.com/s-perera.jpg`}
            />
            <p className="text-[11px] text-gray-500">
              One teacher per line. Photo URL is optional. The order is used when displaying them.
            </p>
          </div>

          {/* Committee members */}
          <div className="space-y-1">
            <label
              htmlFor="committee"
              className="block text-xs font-medium text-gray-700"
            >
              Committee members
            </label>
            <textarea
              id="committee"
              name="committee"
              rows={4}
              defaultValue={defaultCommittee}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              placeholder={`One per line: Name | Title | Photo URL (optional)\nE.g.\nKasun Jayasuriya | President | https://example.com/kasun.jpg\nDilini Fernando | Secretary | https://example.com/dilini.jpg`}
            />
            <p className="text-[11px] text-gray-500">
              One committee member per line. The order here will be used as the display order.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-full bg-[#800000] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#650000] disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Saving…" : "Save club"}
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

  // Public URL path that your Remix app can serve from /public
  return `/clubs/${safeSlug}/${fileName}`;
}

function parsePersonLines(raw: string): PersonLine[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line, index) => {
    const parts = line.split("|").map((p) => p.trim());
    const name = parts[0] || "";
    const roleTitle = parts[1] || "";
    const photoUrl = parts[2] ? parts[2] : null;

    return {
      name,
      roleTitle,
      photoUrl,
      sortOrder: index,
    };
  });
}
