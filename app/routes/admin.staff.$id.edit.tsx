// app/routes/admin.staff.$id.edit.tsx
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
  { title: "Edit Staff Member – KCC Admin" },
];

type StaffRow = {
  id: number;
  name: string;
  photoUrl: string | null;
  roleTitle: string;
  department: string | null;
  isInAdminPage: 0 | 1;
  sortOrder: number;
};

type LoaderData = {
  user: AuthUser;
  staff: StaffRow;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUserWithRole(request, ["ADMIN"]);

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) throw redirect("/admin/staff");

  const [rows] = await pool.query(
    `
      SELECT id, name, photoUrl, roleTitle, department, isInAdminPage, sortOrder
      FROM StaffMember
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  const staffRows = rows as StaffRow[];
  if (!staffRows || staffRows.length === 0) {
    throw redirect("/admin/staff");
  }

  return json<LoaderData>({ user, staff: staffRows[0] });
};

type ActionData = {
  fieldErrors?: {
    name?: string;
    roleTitle?: string;
  };
  formError?: string;
  fields?: {
    name: string;
    roleTitle: string;
    department: string;
    photoUrl: string;
    isInAdminPage: string;
    sortOrder: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  // Only need to ensure user is ADMIN; value not used
  await requireUserWithRole(request, ["ADMIN"]);

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) return redirect("/admin/staff");

  const formData = await request.formData();

  const name = (formData.get("name") || "").toString().trim();
  const roleTitle = (formData.get("roleTitle") || "").toString().trim();
  const department = (formData.get("department") || "").toString().trim();
  const photoUrlText = (formData.get("photoUrl") || "").toString().trim();
  const photoFile = formData.get("photo") ?? null;
  const isInAdminPageRaw = (formData.get("isInAdminPage") || "off").toString();
  const sortOrderRaw = (formData.get("sortOrder") || "").toString().trim();

  const isInAdminPage = isInAdminPageRaw === "on" ? 1 : 0;
  const sortOrder = sortOrderRaw ? Number(sortOrderRaw) : 0;

  const fieldErrors: ActionData["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Name is required";
  if (!roleTitle) fieldErrors.roleTitle = "Role title is required";

  if (fieldErrors.name || fieldErrors.roleTitle) {
    return json<ActionData>(
      {
        fieldErrors,
        fields: {
          name,
          roleTitle,
          department,
          photoUrl: photoUrlText,
          isInAdminPage: isInAdminPageRaw,
          sortOrder: sortOrderRaw,
        },
      },
      { status: 400 }
    );
  }

  // Determine final photoUrl:
  // - If a new file is uploaded, save it and use that URL
  // - Else, use the text URL (which might be existing value)
  let finalPhotoUrl = photoUrlText;

  if (isFile(photoFile) && photoFile.size > 0) {
    finalPhotoUrl = await saveStaffPhoto(photoFile, name);
  }

  try {
    await pool.query(
      `
        UPDATE StaffMember
        SET
          name = ?,
          photoUrl = ?,
          roleTitle = ?,
          department = ?,
          isInAdminPage = ?,
          sortOrder = ?
        WHERE id = ?
      `,
      [
        name,
        finalPhotoUrl || null,
        roleTitle,
        department || null,
        isInAdminPage,
        Number.isNaN(sortOrder) ? 0 : sortOrder,
        id,
      ]
    );
  } catch (err: unknown) {
    console.error("Error updating staff member:", err);
    const error = err as { code?: string };
    const message =
      error.code === "ER_DUP_ENTRY"
        ? "A staff member with similar details already exists."
        : "Something went wrong while saving the staff member.";
    return json<ActionData>(
      {
        formError: message,
        fields: {
          name,
          roleTitle,
          department,
          photoUrl: finalPhotoUrl,
          isInAdminPage: isInAdminPageRaw,
          sortOrder: sortOrderRaw,
        },
      },
      { status: 500 }
    );
  }

  return redirect("/admin/staff");
};

/* ===== Page component ===== */

export default function AdminStaffEditPage() {
  const { user, staff } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const defaultName = actionData?.fields?.name ?? staff.name;
  const defaultRoleTitle =
    actionData?.fields?.roleTitle ?? staff.roleTitle;
  const defaultDepartment =
    actionData?.fields?.department ?? staff.department ?? "";
  const defaultPhotoUrl =
    actionData?.fields?.photoUrl ?? staff.photoUrl ?? "";
  const defaultIsInAdminPage =
    actionData?.fields?.isInAdminPage === "on" || staff.isInAdminPage === 1;
  const defaultSortOrder =
    actionData?.fields?.sortOrder ?? String(staff.sortOrder ?? 0);

  return (
    <AdminLayout user={user} title="Edit staff member">
      <div className="max-w-3xl">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Edit: {staff.name}
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          Update staff information and visibility on the administration page.
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

          {/* Role title */}
          <div className="space-y-1">
            <label
              htmlFor="roleTitle"
              className="block text-xs font-medium text-gray-700"
            >
              Role / designation <span className="text-red-500">*</span>
            </label>
            <input
              id="roleTitle"
              name="roleTitle"
              type="text"
              defaultValue={defaultRoleTitle}
              placeholder="e.g. Principal, Vice Principal, Senior Teacher"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              required
            />
            {actionData?.fieldErrors?.roleTitle && (
              <p className="text-[11px] text-red-600 mt-1">
                {actionData.fieldErrors.roleTitle}
              </p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-1">
            <label
              htmlFor="department"
              className="block text-xs font-medium text-gray-700"
            >
              Department / section
            </label>
            <input
              id="department"
              name="department"
              type="text"
              defaultValue={defaultDepartment}
              placeholder="e.g. Science, Commerce, Administration"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
            />
          </div>

          {/* Existing photo URL + upload */}
          <div className="space-y-2">
            <div className="space-y-1">
              <label
                htmlFor="photoUrl"
                className="block text-xs font-medium text-gray-700"
              >
                Current photo URL
              </label>
              <input
                id="photoUrl"
                name="photoUrl"
                type="text"
                defaultValue={defaultPhotoUrl}
                placeholder="https://… or populated from uploads"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              />
              <p className="text-[11px] text-gray-500">
                If you upload a new photo below, it will replace this URL.
              </p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="photo"
                className="block text-xs font-medium text-gray-700"
              >
                Upload new photo
              </label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                className="block w-full text-xs text-gray-700"
              />
              <p className="text-[11px] text-gray-500">
                Optional. Saved to the server and used as this staff member&apos;s photo.
              </p>
            </div>
          </div>

          {/* Admin page toggle + order */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <span className="block text-xs font-medium text-gray-700">
                Show on administration page
              </span>
              <div className="flex items-start gap-2">
                <input
                  id="isInAdminPage"
                  type="checkbox"
                  name="isInAdminPage"
                  defaultChecked={defaultIsInAdminPage}
                  className="h-4 w-4 mt-0.5 text-[#800000] border-gray-300"
                />
                <label
                  htmlFor="isInAdminPage"
                  className="text-xs text-gray-700"
                >
                  Include in the main administration listing (e.g. principal,
                  deputy principal)
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="sortOrder"
                className="block text-xs font-medium text-gray-700"
              >
                Sorting order
              </label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={defaultSortOrder}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
                placeholder="0"
              />
              <p className="text:[11px] text-gray-500">
                Lower numbers appear first. Use this to order principal,
                vice-principals, etc.
              </p>
            </div>
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

async function saveStaffPhoto(file: File, name: string): Promise<string> {
  const safeBase = slugify(name) || "staff";
  const publicDir = path.join(process.cwd(), "public");
  const uploadDir = path.join(publicDir, "staff");

  await fs.mkdir(uploadDir, { recursive: true });

  const originalName = file.name || "photo.png";
  const ext = path.extname(originalName) || ".png";
  const fileName = `${safeBase}-${Date.now()}${ext.toLowerCase()}`;
  const filePath = path.join(uploadDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  // URL served from /public
  return `/staff/${fileName}`;
}
