// app/routes/logout.ts
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { logout } from "~/utils/auth.server";

// Loader: if someone tries GET /logout, just redirect home
export const loader: LoaderFunction = async () => {
  return redirect("/");
};

// Action: called from <Form method="post" action="/logout">
export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};

export default function LogoutRoute() {
  // This route is not meant to be rendered.
  return null;
}
