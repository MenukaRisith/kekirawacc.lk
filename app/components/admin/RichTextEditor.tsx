// app/components/admin/RichTextEditor.tsx
import { useEffect, useState } from "react";
import type { FC } from "react";
import type ReactQuillType from "react-quill";

import "react-quill/dist/quill.snow.css";

type RichTextEditorProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  helperText?: string;
};

export const RichTextEditor: FC<RichTextEditorProps> = ({
  name,
  label,
  value,
  onChange,
  required,
  error,
  helperText,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [ReactQuill, setReactQuill] = useState<typeof ReactQuillType | null>(
    null
  );

  useEffect(() => {
    setIsClient(true);
    import("react-quill")
      .then((mod) => {
        setReactQuill(() => mod.default);
      })
      .catch((err) => {
        console.error("Failed to load react-quill", err);
      });
  }, []);

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      {/* Hidden input so Remix receives the HTML value */}
      <input type="hidden" name={name} value={value} />

      <div
        className={[
          "rounded-lg border",
          error ? "border-red-300" : "border-gray-300",
          "bg-white",
        ].join(" ")}
      >
        {isClient && ReactQuill ? (
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            className="text-sm"
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link"],
                ["clean"],
              ],
            }}
          />
        ) : (
          // Fallback while loading on server / initial load
          <div className="p-3 text-xs text-gray-500">
            Loading editor…
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-gray-500">{helperText}</p>
      )}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
};
