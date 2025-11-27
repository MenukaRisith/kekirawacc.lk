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
  useSearchParams,
} from "@remix-run/react";
import bcrypt from "bcryptjs";
import { pool } from "~/utils/db.server";
import { getCurrentUser, login } from "~/utils/auth.server";

export const meta: MetaFunction = () => [
  { title: "Login – Kekirawa Central College" },
];

type LoaderData = {
  redirectTo: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getCurrentUser(request);
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/admin";

  if (user) {
    // Already logged in, send them to redirectTo
    throw redirect(redirectTo);
  }

  return json<LoaderData>({ redirectTo });
};

type ActionData = {
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  formError?: string;
  fields?: {
    email: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = (formData.get("email") || "").toString().trim();
  const password = (formData.get("password") || "").toString();
  const redirectTo =
    (formData.get("redirectTo") || "/admin").toString() || "/admin";

  // Basic validation
  const fieldErrors: ActionData["fieldErrors"] = {};
  if (!email) fieldErrors.email = "Email is required";
  if (!password) fieldErrors.password = "Password is required";

  if (fieldErrors.email || fieldErrors.password) {
    return json<ActionData>(
      { fieldErrors, fields: { email } },
      { status: 400 }
    );
  }

  // Look up user
  const [rows] = await pool.query(
    `
      SELECT id, email, passwordHash
      FROM User
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  const users = rows as { id: number; email: string; passwordHash: string }[];

  if (!users || users.length === 0) {
    return json<ActionData>(
      {
        formError: "Invalid email or password",
        fields: { email },
      },
      { status: 400 }
    );
  }

  const user = users[0];

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return json<ActionData>(
      {
        formError: "Invalid email or password",
        fields: { email },
      },
      { status: 400 }
    );
  }

  // Success → create session with auth.server.ts
  return login({ request, userId: user.id, redirectTo });
};

export default function LoginPage() {
  const { redirectTo } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";
  const defaultEmail = actionData?.fields?.email ?? "";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8">
        {/* Logo + title */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/branding/logo.png"
            alt="KCC Logo"
            className="h-14 w-14 object-contain mb-2"
          />
          <h1 className="text-lg font-semibold text-gray-900">
            KCC Admin Login
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Sign in to manage news, events, clubs and more.
          </p>
        </div>

        {actionData?.formError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {actionData.formError}
          </div>
        )}

        <Form method="post" replace className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={defaultEmail}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              required
            />
            {actionData?.fieldErrors?.email && (
              <p className="text-[11px] text-red-600 mt-1">
                {actionData.fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
              required
            />
            {actionData?.fieldErrors?.password && (
              <p className="text-[11px] text-red-600 mt-1">
                {actionData.fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#800000] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#650000] disabled:opacity-70 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </Form>

        <p className="mt-4 text-[11px] text-gray-500 text-center">
          You will be redirected to{" "}
          <span className="font-medium text-gray-700">
            {searchParams.get("redirectTo") || "/admin"}
          </span>{" "}
          after login.
        </p>

        <p className="mt-4 text-[11px] text-gray-400 text-center">
          Built for{" "}
          <span className="text-[#800000] font-semibold">
            Kekirawa Central College ICT Society
          </span>
          .
        </p>
      </div>
    </div>
  );
}
