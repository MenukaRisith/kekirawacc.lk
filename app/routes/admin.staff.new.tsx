// app/routes/admin.staff.new.tsx
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
  { title: "New Staff Member – KCC Admin" },
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
    roleTitle?: string;
  };
  formError?: string;
  fields?: {
    name: string;
    roleTitle: string;
    department: string;
    // we keep this just for error state, but the real image path
    // is derived from the uploaded file
    photoUrl: string;
    isInAdminPage: string;
    sortOrder: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  // We just need to ensure user is ADMIN – no need to keep the value
  await requireUserWithRole(request, ["ADMIN"]);

  const formData = await request.formData();

  const name = (formData.get("name") || "").toString().trim();
  const roleTitle = (formData.get("roleTitle") || "").toString().trim();
  const department = (formData.get("department") || "").toString().trim();
  const isInAdminPageRaw = (formData.get("isInAdminPage") || "off").toString();
  const sortOrderRaw = (formData.get("sortOrder") || "").toString().trim();

  const photoFile = formData.get("photo") ?? null;

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
          photoUrl: "",
          isInAdminPage: isInAdminPageRaw,
          sortOrder: sortOrderRaw,
        },
      },
      { status: 400 }
    );
  }

  // Save photo if uploaded
  let photoUrl = "";
  if (isFile(photoFile) && photoFile.size > 0) {
    photoUrl = await saveStaffPhoto(photoFile, name);
  }

  try {
    await pool.query(
      `
        INSERT INTO StaffMember
          (name, photoUrl, roleTitle, department, isInAdminPage, sortOrder)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        photoUrl || null,
        roleTitle,
        department || null,
        isInAdminPage,
        Number.isNaN(sortOrder) ? 0 : sortOrder,
      ]
    );
  } catch (err: unknown) {
    console.error("Error creating staff member:", err);
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
          photoUrl,
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

export default function AdminStaffNewPage() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const defaultName = actionData?.fields?.name || "";
  const defaultRoleTitle = actionData?.fields?.roleTitle || "";
  const defaultDepartment = actionData?.fields?.department || "";
  const defaultIsInAdminPage = actionData?.fields?.isInAdminPage === "on";
  const defaultSortOrder = actionData?.fields?.sortOrder || "";

  return (
    <AdminLayout user={user} title="New staff member">
      <div className="max-w-3xl">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Add staff member
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          Add teachers, principals and office staff to the website listings.
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

          {/* Photo upload */}
          <div className="space-y-1">
            <label
              htmlFor="photo"
              className="block text-xs font-medium text-gray-700"
            >
              Photo
            </label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              className="block w-full text-xs text-gray-700"
            />
            <p className="text-[11px] text-gray-500">
              Optional. Used on the staff and administration pages.
            </p>
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
              <p className="text-[11px] text-gray-500">
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
              {isSubmitting ? "Saving…" : "Save staff member"}
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
