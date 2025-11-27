// app/routes/admin.events.$id.edit.tsx
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
  { title: "Edit Event – KCC Admin" },
];

type ClubRow = {
  id: number;
  name: string;
};

type EventEditRow = {
  id: number;
  title: string;
  slug: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string | null;
  coverImage: string | null;
  category: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  clubId: number | null;
  createdById: number;
};

type LoaderData = {
  user: AuthUser;
  event: EventEditRow;
  clubs: ClubRow[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUserWithRole(request, [
    "ADMIN",
    "AUTHOR",
    "CLUB_REP",
  ]);

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) throw redirect("/admin/events");

  // Fetch event
  const [rows] = await pool.query(
    `
      SELECT id, title, slug, description, location, startDate, endDate,
             coverImage, category, status, publishedAt, clubId, createdById
      FROM Event
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  const events = rows as EventEditRow[];
  if (!events || events.length === 0) throw redirect("/admin/events");

  const event = events[0];

  // Permission: non-admin can only edit their own events
  if (user.role !== "ADMIN" && event.createdById !== user.id) {
    throw redirect("/admin/events");
  }

  // Load clubs according to role
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

  return json<LoaderData>({ user, event, clubs });
};

type ActionData = {
  fieldErrors?: {
    title?: string;
    location?: string;
    startDate?: string;
    description?: string;
  };
  formError?: string;
  fields?: {
    title: string;
    slug: string;
    category: string;
    location: string;
    startDate: string;
    endDate: string;
    coverImage: string;
    description: string;
    status: "DRAFT" | "PUBLISHED";
    clubId: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUserWithRole(request, [
    "ADMIN",
    "AUTHOR",
    "CLUB_REP",
  ]);

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) return redirect("/admin/events");

  // Fetch existing event for permissions + previous publishedAt / clubId
  const [rows] = await pool.query(
    `
      SELECT id, createdById, status, publishedAt, clubId
      FROM Event
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );
  const events = rows as {
    id: number;
    createdById: number;
    status: "DRAFT" | "PUBLISHED";
    publishedAt: string | null;
    clubId: number | null;
  }[];

  if (!events || events.length === 0) return redirect("/admin/events");

  const existing = events[0];

  if (user.role !== "ADMIN" && existing.createdById !== user.id) {
    return redirect("/admin/events");
  }

  const formData = await request.formData();

  const title = (formData.get("title") || "").toString().trim();
  let slug = (formData.get("slug") || "").toString().trim();
  const category = (formData.get("category") || "").toString().trim();
  const location = (formData.get("location") || "").toString().trim();
  const startDateRaw = (formData.get("startDate") || "").toString().trim();
  const endDateRaw = (formData.get("endDate") || "").toString().trim();
  const coverImage = (formData.get("coverImage") || "").toString().trim();
  const description = (formData.get("description") || "").toString();
  const statusRaw = (formData.get("status") || "DRAFT").toString();
  const clubIdRaw = (formData.get("clubId") || "").toString();

  const status: "DRAFT" | "PUBLISHED" =
    statusRaw === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  if (!slug && title) {
    slug = slugify(title);
  }

  const fieldErrors: ActionData["fieldErrors"] = {};

  if (!title) fieldErrors.title = "Title is required";
  if (!location) fieldErrors.location = "Location is required";
  if (!startDateRaw) fieldErrors.startDate = "Start date & time is required";
  if (
    !description ||
    description.replace(/<(.|\n)*?>/g, "").trim().length === 0
  ) {
    fieldErrors.description = "Description is required";
  }

  if (
    fieldErrors.title ||
    fieldErrors.location ||
    fieldErrors.startDate ||
    fieldErrors.description
  ) {
    return json<ActionData>(
      {
        fieldErrors,
        fields: {
          title,
          slug,
          category,
          location,
          startDate: startDateRaw,
          endDate: endDateRaw,
          coverImage,
          description,
          status,
          clubId: clubIdRaw,
        },
      },
      { status: 400 }
    );
  }

  const startDate = new Date(startDateRaw);
  const endDate =
    endDateRaw && endDateRaw.length > 0 ? new Date(endDateRaw) : null;

  let clubId: number | null = null;
  if (user.role === "ADMIN" || user.role === "AUTHOR") {
    clubId = clubIdRaw ? Number(clubIdRaw) : null;
  } else if (user.role === "CLUB_REP") {
    clubId = user.clubId ?? existing.clubId ?? null;
  }

  let publishedAt: Date | null = null;
  if (status === "PUBLISHED") {
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
        UPDATE Event
        SET
          title = ?,
          slug = ?,
          description = ?,
          location = ?,
          startDate = ?,
          endDate = ?,
          coverImage = ?,
          category = ?,
          status = ?,
          publishedAt = ?,
          clubId = ?
        WHERE id = ?
      `,
      [
        title,
        slug,
        description,
        location,
        startDate,
        endDate,
        coverImage || null,
        category || null,
        status,
        publishedAt,
        clubId,
        id,
      ]
    );
  } catch (err: unknown) {
    console.error("Error updating event:", err);
    const error = err as { code?: string };
    const message =
      error.code === "ER_DUP_ENTRY"
        ? "Slug already exists. Please choose another one."
        : "Something went wrong while saving the event.";
    return json<ActionData>(
      {
        formError: message,
        fields: {
          title,
          slug,
          category,
          location,
          startDate: startDateRaw,
          endDate: endDateRaw,
          coverImage,
          description,
          status,
          clubId: clubIdRaw,
        },
      },
      { status: 500 }
    );
  }

  return redirect("/admin/events");
};

/* ===== Page component ===== */

export default function AdminEventsEditPage() {
  const { user, event, clubs } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [description, setDescription] = useState(
    actionData?.fields?.description ?? event.description
  );

  const defaultStatus = actionData?.fields?.status ?? event.status;
  const defaultTitle = actionData?.fields?.title ?? event.title;
  const defaultSlug = actionData?.fields?.slug ?? event.slug;
  const defaultCategory =
    actionData?.fields?.category ?? event.category ?? "";
  const defaultLocation =
    actionData?.fields?.location ?? event.location ?? "";
  const defaultStartDate =
    actionData?.fields?.startDate ?? toInputDateTime(event.startDate);
  const defaultEndDate =
    actionData?.fields?.endDate ??
    (event.endDate ? toInputDateTime(event.endDate) : "");
  const defaultCoverImage =
    actionData?.fields?.coverImage ?? event.coverImage ?? "";
  const defaultClubId =
    actionData?.fields?.clubId ??
    (event.clubId ? String(event.clubId) : "");

  const isClubRep = user.role === "CLUB_REP";

  return (
    <AdminLayout user={user} title="Edit event">
      <div className="max-w-3xl">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Edit: {event.title}
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          Update event details and schedule.
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
                /events/your-slug-here
              </span>
              .
            </p>
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
              placeholder="e.g. Sports, Assembly, Competition"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
            />
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label
              htmlFor="location"
              className="block text-xs font-medium text-gray-700"
            >
              Location <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              name="location"
              type="text"
              defaultValue={defaultLocation}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              required
            />
            {actionData?.fieldErrors?.location && (
              <p className="text-[11px] text-red-600 mt-1">
                {actionData.fieldErrors.location}
              </p>
            )}
          </div>

          {/* Date/time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="startDate"
                className="block text-xs font-medium text-gray-700"
              >
                Start date & time <span className="text-red-500">*</span>
              </label>
              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                defaultValue={defaultStartDate}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
                required
              />
              {actionData?.fieldErrors?.startDate && (
                <p className="text-[11px] text-red-600 mt-1">
                  {actionData.fieldErrors.startDate}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label
                htmlFor="endDate"
                className="block text-xs font-medium text-gray-700"
              >
                End date & time
              </label>
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                defaultValue={defaultEndDate}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              />
            </div>
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
              For now, paste an image URL. Later you can add file uploads.
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
                <span>Published</span>
              </label>
            </div>
          </fieldset>

          {/* Description (rich text) */}
          <RichTextEditor
            name="description"
            label="Description"
            value={description}
            onChange={setDescription}
            required
            helperText="Describe what this event is about, who can join, and any key details."
            error={actionData?.fieldErrors?.description}
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

/* ===== Helpers ===== */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 190);
}

function toInputDateTime(value: string): string {
  const d = new Date(value);
  const iso = d.toISOString(); // 2025-03-01T10:00:00.000Z
  return iso.slice(0, 16); // "YYYY-MM-DDTHH:MM"
}
