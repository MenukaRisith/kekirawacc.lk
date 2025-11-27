// app/routes/admin.news.new.tsx
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
import { useState } from "react";
import fs from "fs/promises";
import path from "path";
import { pool } from "~/utils/db.server";
import {
  requireUserWithRole,
  type AuthUser,
} from "~/utils/auth.server";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { RichTextEditor } from "~/components/admin/RichTextEditor";

export const meta: MetaFunction = () => [
  { title: "New News Post – KCC Admin" },
];

type ClubRow = {
  id: number;
  name: string;
};

type LoaderData = {
  user: AuthUser;
  clubs: ClubRow[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserWithRole(request, [
    "ADMIN",
    "AUTHOR",
    "CLUB_REP",
  ]);

  let clubs: ClubRow[] = [];

  if (user.role === "ADMIN" || user.role === "AUTHOR") {
    const [rows] = await pool.query(
      `SELECT id, name FROM Club ORDER BY name ASC`
    );
    clubs = rows as ClubRow[];
  } else if (user.role === "CLUB_REP" && user.clubId) {
    const [rows] = await pool.query(
      `SELECT id, name FROM Club WHERE id = ? LIMIT 1`,
      [user.clubId]
    );
    clubs = rows as ClubRow[];
  }

  return json<LoaderData>({ user, clubs });
};

type ActionData = {
  fieldErrors?: {
    title?: string;
    content?: string;
  };
  formError?: string;
  fields?: {
    title: string;
    slug: string;
    excerpt: string;
    metaKeywords: string; // 👈 new
    coverImage: string;
    content: string;
    status: "DRAFT" | "PUBLISHED";
    clubId: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserWithRole(request, [
    "ADMIN",
    "AUTHOR",
    "CLUB_REP",
  ]);

  const formData = await request.formData();

  const title = (formData.get("title") || "").toString().trim();
  let slug = (formData.get("slug") || "").toString().trim();
  const excerpt = (formData.get("excerpt") || "").toString().trim();
  const metaKeywords = (formData.get("metaKeywords") || "")
    .toString()
    .trim(); // 👈 new
  const content = (formData.get("content") || "").toString();
  const statusRaw = (formData.get("status") || "DRAFT").toString();
  const clubIdRaw = (formData.get("clubId") || "").toString();

  const status: "DRAFT" | "PUBLISHED" =
    statusRaw === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  // Generate slug if missing
  if (!slug && title) {
    slug = slugify(title);
  }

  const fieldErrors: ActionData["fieldErrors"] = {};
  if (!title) fieldErrors.title = "Title is required";
  if (!content || content.replace(/<(.|\n)*?>/g, "").trim().length === 0) {
    fieldErrors.content = "Content is required";
  }

  if (fieldErrors.title || fieldErrors.content) {
    return json<ActionData>(
      {
        fieldErrors,
        fields: {
          title,
          slug,
          excerpt,
          metaKeywords,
          coverImage: "",
          content,
          status,
          clubId: clubIdRaw,
        },
      },
      { status: 400 }
    );
  }

  // Determine clubId based on role
  let clubId: number | null = null;
  if (user.role === "ADMIN" || user.role === "AUTHOR") {
    clubId = clubIdRaw ? Number(clubIdRaw) : null;
  } else if (user.role === "CLUB_REP") {
    // Force to user's club
    clubId = user.clubId ?? null;
  }

  const now = new Date();
  const dateFolder = now.toISOString().slice(0, 10); // e.g. "2025-11-24"
  const publishedAt = status === "PUBLISHED" ? now : null;

  let coverImagePath: string | null = null;

  try {
    // Handle file upload
    const coverImageFile = formData.get("coverImage");

    if (
      coverImageFile &&
      coverImageFile instanceof File &&
      coverImageFile.size > 0
    ) {
      const arrayBuffer = await coverImageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "news",
        dateFolder,
        "img"
      );
      await fs.mkdir(uploadDir, { recursive: true });

      const originalName = coverImageFile.name || "cover.jpg";
      const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const fileName = `${Date.now()}-${safeName}`;

      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      // Path that the browser can use
      coverImagePath = `/news/${dateFolder}/img/${fileName}`;
    }

    await pool.query(
      `
      INSERT INTO NewsPost
        (title, slug, excerpt, metaKeywords, content, coverImage, status, publishedAt, authorId, clubId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        slug,
        excerpt || null,
        metaKeywords || null, // 👈 new
        content,
        coverImagePath,
        status,
        publishedAt,
        user.id,
        clubId,
      ]
    );
  } catch (err: unknown) {
    console.error("Error creating news post:", err);
    const error = err as { code?: string };

    const message =
      error.code === "ER_DUP_ENTRY"
        ? "Slug already exists. Please choose another one."
        : "Something went wrong while saving the post.";

    return json<ActionData>(
      {
        formError: message,
        fields: {
          title,
          slug,
          excerpt,
          metaKeywords,
          coverImage: coverImagePath ?? "",
          content,
          status,
          clubId: clubIdRaw,
        },
      },
      { status: 500 }
    );
  }

  return redirect("/admin/news");
};

/* ===== Page component ===== */

export default function AdminNewsNewPage() {
  const { user, clubs } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [content, setContent] = useState(
    actionData?.fields?.content || ""
  );

  const defaultStatus = actionData?.fields?.status || "DRAFT";

  const defaultTitle = actionData?.fields?.title || "";
  const defaultSlug = actionData?.fields?.slug || "";
  const defaultExcerpt = actionData?.fields?.excerpt || "";
  const defaultMetaKeywords = actionData?.fields?.metaKeywords || ""; // 👈
  const defaultClubId = actionData?.fields?.clubId || "";

  const isClubRep = user.role === "CLUB_REP";

  return (
    <AdminLayout user={user} title="New news post">
      <div className="max-w-3xl">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Create news post
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          Publish announcements, achievements and updates to appear on the
          public website.
        </p>

        {actionData?.formError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {actionData.formError}
          </div>
        )}

        <Form method="post" encType="multipart/form-data" className="space-y-5">
          {/* Title */}
          <div className="space-y-1">
            <label
              htmlFor="title"
              className="block text-xs font-medium text-gray-700"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={defaultTitle}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              required
            />
            {actionData?.fieldErrors?.title && (
              <p className="text-[11px] text-red-600 mt-1">
                {actionData.fieldErrors.title}
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <label
              htmlFor="slug"
              className="block text-xs font-medium text-gray-700"
            >
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              defaultValue={defaultSlug}
              placeholder="auto-generated-from-title if left blank"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
            />
            <p className="text-[11px] text-gray-500">
              This will be used in the URL, e.g.{" "}
              <span className="font-mono text-gray-700">
                /news/your-slug-here
              </span>
              .
            </p>
          </div>

          {/* Excerpt */}
          <div className="space-y-1">
            <label
              htmlFor="excerpt"
              className="block text-xs font-medium text-gray-700"
            >
              Short description
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              defaultValue={defaultExcerpt}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              placeholder="Optional summary shown in lists."
            />
          </div>

          {/* Meta keywords / tags */}
          <div className="space-y-1">
            <label
              htmlFor="metaKeywords"
              className="block text-xs font-medium text-gray-700"
            >
              SEO tags / keywords
            </label>
            <input
              id="metaKeywords"
              name="metaKeywords"
              type="text"
              defaultValue={defaultMetaKeywords}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              placeholder="e.g. sports meet, athletics, inter-house 2025"
            />
            <p className="text-[11px] text-gray-500">
              Optional. Comma-separated keywords used for SEO meta tags.
            </p>
          </div>

          {/* Cover image file */}
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
              className="block w-full text-xs text-gray-700
                         file:mr-3 file:rounded-lg file:border-0
                         file:bg-[#800000] file:px-3 file:py-1.5
                         file:text-xs file:font-semibold file:text-white
                         hover:file:bg-[#650000]"
            />
            <p className="text-[11px] text-gray-500">
              Upload a JPG or PNG image. It will be stored in{" "}
              <code>/public/news/&lt;date&gt;/img</code>.
            </p>
          </div>

          {/* Club */}
          <div className="space-y-1">
            <label
              htmlFor="clubId"
              className="block text-xs font-medium text-gray-700"
            >
              Linked club / society
            </label>
            {isClubRep ? (
              <div className="text-xs text-gray-700">
                {clubs[0]?.name || "Your club"} (auto-linked)
              </div>
            ) : (
              <select
                id="clubId"
                name="clubId"
                defaultValue={defaultClubId}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              >
                <option value="">No specific club</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Status */}
          <fieldset className="space-y-1">
            <legend className="block text-xs font-medium text-gray-700">
              Status
            </legend>
            <div className="flex gap-4 text-xs">
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  defaultChecked={defaultStatus === "DRAFT"}
                  className="h-3 w-3 text-[#800000] border-gray-300"
                />
                <span>Save as draft</span>
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  defaultChecked={defaultStatus === "PUBLISHED"}
                  className="h-3 w-3 text-[#800000] border-gray-300"
                />
                <span>Publish immediately</span>
              </label>
            </div>
          </fieldset>

          {/* Content (rich text) */}
          <RichTextEditor
            name="content"
            label="Content"
            value={content}
            onChange={setContent}
            required
            helperText="Use the toolbar to format your text. Links and bullet lists are supported."
            error={actionData?.fieldErrors?.content}
          />

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-full bg-[#800000] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#650000] disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Saving…" : "Save post"}
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
    .substring(0, 190); // keep under 191 chars
}
