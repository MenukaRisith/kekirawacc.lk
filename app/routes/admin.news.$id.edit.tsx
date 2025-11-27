// app/routes/admin.news.$id.edit.tsx
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
import { pool } from "~/utils/db.server";
import {
  requireUserWithRole,
  type AuthUser,
} from "~/utils/auth.server";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { RichTextEditor } from "~/components/admin/RichTextEditor";

export const meta: MetaFunction = () => [
  { title: "Edit News Post – KCC Admin" },
];

type ClubRow = {
  id: number;
  name: string;
};

type NewsEditRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  clubId: number | null;
  authorId: number;
  metaKeywords: string | null; // 👈 SEO meta tags
};

type LoaderData = {
  user: AuthUser;
  post: NewsEditRow;
  clubs: ClubRow[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUserWithRole(request, [
    "ADMIN",
    "AUTHOR",
    "CLUB_REP",
  ]);

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) {
    throw redirect("/admin/news");
  }

  // Fetch the post
  const [rows] = await pool.query(
    `
      SELECT
        id,
        title,
        slug,
        excerpt,
        content,
        coverImage,
        status,
        publishedAt,
        clubId,
        authorId,
        metaKeywords
      FROM NewsPost
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );
  const posts = rows as NewsEditRow[];
  if (!posts || posts.length === 0) {
    throw redirect("/admin/news");
  }

  const post = posts[0];

  // Permission: non-admin can edit only their own posts
  if (user.role !== "ADMIN" && post.authorId !== user.id) {
    throw redirect("/admin/news");
  }

  // Load clubs
  let clubs: ClubRow[] = [];
  if (user.role === "ADMIN" || user.role === "AUTHOR") {
    const [clubRows] = await pool.query(
      `SELECT id, name FROM Club ORDER BY name ASC`
    );
    clubs = clubRows as ClubRow[];
  } else if (user.role === "CLUB_REP" && user.clubId) {
    const [clubRows] = await pool.query(
      `SELECT id, name FROM Club WHERE id = ? LIMIT 1`,
      [user.clubId]
    );
    clubs = clubRows as ClubRow[];
  }

  return json<LoaderData>({ user, post, clubs });
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
    coverImage: string;
    content: string;
    status: "DRAFT" | "PUBLISHED";
    clubId: string;
    metaKeywords: string; // 👈 keep form value on error
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUserWithRole(request, [
    "ADMIN",
    "AUTHOR",
    "CLUB_REP",
  ]);

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) {
    return redirect("/admin/news");
  }

  // Fetch existing post to enforce permissions & previous status
  const [rows] = await pool.query(
    `
      SELECT id, authorId, status, publishedAt, clubId
      FROM NewsPost
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );
  const posts = rows as {
    id: number;
    authorId: number;
    status: "DRAFT" | "PUBLISHED";
    publishedAt: string | null;
    clubId: number | null;
  }[];

  if (!posts || posts.length === 0) {
    return redirect("/admin/news");
  }

  const existing = posts[0];

  // Permission
  if (user.role !== "ADMIN" && existing.authorId !== user.id) {
    return redirect("/admin/news");
  }

  const formData = await request.formData();

  const title = (formData.get("title") || "").toString().trim();
  let slug = (formData.get("slug") || "").toString().trim();
  const excerpt = (formData.get("excerpt") || "").toString().trim();
  const coverImage = (formData.get("coverImage") || "").toString().trim();
  const content = (formData.get("content") || "").toString();
  const statusRaw = (formData.get("status") || "DRAFT").toString();
  const clubIdRaw = (formData.get("clubId") || "").toString();
  const metaKeywords = (formData.get("metaKeywords") || "")
    .toString()
    .trim(); // 👈 new field

  const status = statusRaw === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

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
          coverImage,
          content,
          status,
          clubId: clubIdRaw,
          metaKeywords,
        },
      },
      { status: 400 }
    );
  }

  let clubId: number | null = null;
  if (user.role === "ADMIN" || user.role === "AUTHOR") {
    clubId = clubIdRaw ? Number(clubIdRaw) : null;
  } else if (user.role === "CLUB_REP") {
    clubId = user.clubId ?? existing.clubId ?? null;
  }

  let publishedAt: Date | null = null;
  if (status === "PUBLISHED") {
    // If already had a publishedAt, keep it, else set now
    if (existing.publishedAt) {
      publishedAt = new Date(existing.publishedAt);
    } else {
      publishedAt = new Date();
    }
  } else {
    publishedAt = null;
  }

  try {
    await pool.query(
      `
        UPDATE NewsPost
        SET
          title = ?,
          slug = ?,
          excerpt = ?,
          content = ?,
          coverImage = ?,
          status = ?,
          publishedAt = ?,
          clubId = ?,
          metaKeywords = ?
        WHERE id = ?
      `,
      [
        title,
        slug,
        excerpt || null,
        content,
        coverImage || null,
        status,
        publishedAt,
        clubId,
        metaKeywords || null, // 👈 nullable in DB
        id,
      ]
    );
  } catch (err: unknown) {
    console.error("Error updating news post:", err);
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
          coverImage,
          content,
          status,
          clubId: clubIdRaw,
          metaKeywords,
        },
      },
      { status: 500 }
    );
  }

  return redirect("/admin/news");
};

/* ===== Page component ===== */

export default function AdminNewsEditPage() {
  const { user, post, clubs } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [content, setContent] = useState(
    actionData?.fields?.content ?? post.content
  );

  const defaultStatus = actionData?.fields?.status ?? post.status;
  const defaultTitle = actionData?.fields?.title ?? post.title;
  const defaultSlug = actionData?.fields?.slug ?? post.slug;
  const defaultExcerpt = actionData?.fields?.excerpt ?? post.excerpt ?? "";
  const defaultCoverImage =
    actionData?.fields?.coverImage ?? post.coverImage ?? "";
  const defaultClubId =
    actionData?.fields?.clubId ?? (post.clubId ? String(post.clubId) : "");
  const defaultMetaKeywords =
    actionData?.fields?.metaKeywords ?? post.metaKeywords ?? ""; // 👈

  const isClubRep = user.role === "CLUB_REP";

  return (
    <AdminLayout user={user} title="Edit news post">
      <div className="max-w-3xl">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Edit: {post.title}
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          Update the content and details of this news post.
        </p>

        {actionData?.formError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {actionData.formError}
          </div>
        )}

        <Form method="post" className="space-y-5">
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
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
            />
            <p className="text-[11px] text-gray-500">
              Used in the URL, e.g.{" "}
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

          {/* Cover image URL */}
          <div className="space-y-1">
            <label
              htmlFor="coverImage"
              className="block text-xs font-medium text-gray-700"
            >
              Cover image URL
            </label>
            <input
              id="coverImage"
              name="coverImage"
              type="text"
              defaultValue={defaultCoverImage}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              placeholder="https://…"
            />
            <p className="text-[11px] text-gray-500">
              Paste an image URL. (Upload support can be added later.)
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

          {/* SEO meta keywords */}
          <div className="space-y-1">
            <label
              htmlFor="metaKeywords"
              className="block text-xs font-medium text-gray-700"
            >
              SEO meta keywords
            </label>
            <input
              id="metaKeywords"
              name="metaKeywords"
              type="text"
              defaultValue={defaultMetaKeywords}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              placeholder="e.g. ICT, KCC, school news, competitions"
            />
            <p className="text-[11px] text-gray-500">
              Optional. Comma-separated keywords for search engines.
            </p>
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
                <span>Published</span>
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
            helperText="Use the toolbar to format your text."
            error={actionData?.fieldErrors?.content}
          />

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

/* ===== Helper ===== */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 190);
}
