// app/routes/contact.tsx
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";

export const meta: MetaFunction = () => [
  { title: "Contact – Kekirawa Central College" },
  {
    name: "description",
    content:
      "Contact the administration of Kekirawa Central College – address, phone, email and contact form.",
  },
];

type ActionData = {
  ok: boolean;
  fieldErrors?: {
    name?: string;
    email?: string;
    message?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const message = (formData.get("message") || "").toString().trim();

  const fieldErrors: ActionData["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Required";
  if (!email) fieldErrors.email = "Required";
  if (!message) fieldErrors.message = "Required";

  if (fieldErrors.name || fieldErrors.email || fieldErrors.message) {
    return json<ActionData>(
      { ok: false, fieldErrors },
      { status: 400 }
    );
  }

  // later: send email / save in DB
  console.log("📩 Contact form submitted:", { name, email, message });

  return json<ActionData>({ ok: true });
};

export default function ContactPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#800000] mb-2">
            Contact Us
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            Reach out to Kekirawa Central College
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl">
            If you have questions regarding admissions, academic programs,
            events or general inquiries, our administrative team is here to help.
          </p>
        </div>
      </section>

      {/* GRID LAYOUT */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16 grid gap-10 md:grid-cols-[1fr_1fr]">
        {/* Left - Contact details */}
        <div>
          <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
            School information
          </h2>

          <ul className="space-y-4 text-sm text-gray-700">
            <li>
              <p className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-[#800000]" />
                Address
              </p>
              Kekirawa Central College, Talawa Rd, Kekirawa 50100
            </li>

            <li>
              <p className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <i className="fa-solid fa-phone text-[#800000]" />
                Phone
              </p>
              0252 264 234
            </li>

            <li>
              <p className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <i className="fa-solid fa-envelope text-[#800000]" />
                General email
              </p>
              <a
                href="mailto:contact@kekirawacc.lk"
                className="hover:underline"
              >
                contact@kekirawacc.lk
              </a>
            </li>

            <li>
              <p className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <i className="fa-solid fa-user-tie text-[#800000]" />
                Principal&apos;s email
              </p>
              <a
                href="mailto:principalkcc@gmail.com"
                className="hover:underline"
              >
                principalkcc@gmail.com
              </a>
            </li>
          </ul>

          {/* Map */}
          <div className="mt-8 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <iframe
              title="Kekirawa Central College Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.58679300146!2d80.58259257577305!3d8.041465191985594!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afc963381790425%3A0x8b197da64998cf49!2sKekirawa%20Central%20College!5e0!3m2!1sen!2slk!4v1764111038311!5m2!1sen!2slk"
              width="600"
              height="330"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Right - Contact form */}
        <div>
          <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
            Send us a message
          </h2>

          {actionData?.ok && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
              Your message has been submitted successfully. Thank you!
            </div>
          )}

          <Form method="post" className="space-y-5">
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-xs font-medium text-gray-700"
              >
                Your name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#800000] focus:ring-[#800000]"
              />
              {actionData?.fieldErrors?.name && (
                <p className="text-[11px] text-red-600">
                  {actionData.fieldErrors.name}
                </p>
              )}
            </div>

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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#800000] focus:ring-[#800000]"
              />
              {actionData?.fieldErrors?.email && (
                <p className="text-[11px] text-red-600">
                  {actionData.fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="message"
                className="block text-xs font-medium text-gray-700"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#800000] focus:ring-[#800000]"
              />
              {actionData?.fieldErrors?.message && (
                <p className="text-[11px] text-red-600">
                  {actionData.fieldErrors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-full bg-[#800000] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#650000] disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Sending…" : "Send message"}
            </button>
          </Form>
        </div>
      </section>
    </div>
  );
}
