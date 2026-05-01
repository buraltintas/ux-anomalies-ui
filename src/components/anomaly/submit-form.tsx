"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";

const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const categoryValues = [
  "web",
  "mobile_app",
  "automotive_display",
  "device_screen",
  "tv",
  "game",
  "other",
] as const;

const submitSchema = z.object({
  title: z.string().trim().max(160).optional(),
  category: z.enum(categoryValues, { message: "Choose a valid category." }),
  description: z.string().trim().min(1, "Tell us what happened."),
  sourceUrl: z
    .string()
    .trim()
    .optional()
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Enter a valid http or https URL."),
  images: z
    .array(z.instanceof(File))
    .min(1, "Add at least one screenshot.")
    .max(MAX_IMAGES, `Add up to ${MAX_IMAGES} screenshots.`)
    .refine((files) => files.every((file) => file.size > 0), "One of your files is empty.")
    .refine(
      (files) => files.every((file) => allowedMimeTypes.has(file.type)),
      "Only JPG, PNG, or WEBP files are supported.",
    )
    .refine(
      (files) => files.every((file) => file.size <= MAX_IMAGE_BYTES),
      "Each image must be 8MB or smaller.",
    ),
});

type SubmitFormValues = z.infer<typeof submitSchema>;

function mapApiError(message: string | undefined) {
  const normalized = (message ?? "").toLowerCase();

  if (normalized.includes("images") && normalized.includes("required")) {
    return "Add at least one screenshot.";
  }
  if (normalized.includes("category") && (normalized.includes("invalid") || normalized.includes("must"))) {
    return "Choose a valid category.";
  }
  if (normalized.includes("source_url") || normalized.includes("source url")) {
    return "Enter a valid http or https URL.";
  }

  return "We couldn't submit this anomaly. Please try again.";
}

export function SubmitForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SubmitFormValues>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      title: "",
      category: "web",
      description: "",
      sourceUrl: "",
      images: [],
    },
  });

  const watchedImages = useWatch({ control: form.control, name: "images" });
  const images = useMemo(() => watchedImages ?? [], [watchedImages]);

  const previews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const onFilesSelected = (incoming: FileList | null) => {
    if (!incoming) return;

    const next = [...images, ...Array.from(incoming)].slice(0, MAX_IMAGES);
    form.setValue("images", next, { shouldValidate: true, shouldDirty: true });
    form.clearErrors("images");
  };

  const removeImage = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    form.setValue("images", next, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);

    try {
      const data = new FormData();
      data.set("category", values.category);
      if (values.title?.trim()) data.set("title", values.title.trim());
      data.set("description", values.description.trim());
      if (values.sourceUrl?.trim()) data.set("source_url", values.sourceUrl.trim());
      values.images.forEach((file) => data.append("images", file));

      const res = await fetch("/api/anomalies", {
        method: "POST",
        body: data,
      });

      const body = (await res.json().catch(() => ({}))) as {
        message?: string;
        detail?: string;
        anomaly?: { slug?: string };
        slug?: string;
      };

      if (!res.ok) {
        const message = mapApiError(body.detail ?? body.message);
        toast.error(message);
        return;
      }

      const slug = body.slug ?? body.anomaly?.slug;
      toast.success("Anomaly submitted successfully.");
      router.push(slug ? `/anomalies/${slug}` : "/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Share a UX anomaly</h1>
        <p className="text-sm text-muted-foreground">
          Submit real product friction so others can learn from what users actually experience.
        </p>
      </header>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          placeholder="Date label appears as 383w"
          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-primary/60 placeholder:text-muted-foreground focus:ring-2"
          {...form.register("title")}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-primary/60 focus:ring-2"
          {...form.register("category")}
        >
          {categoryValues.map((value) => (
            <option key={value} value={value}>
              {value.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        {form.formState.errors.category ? (
          <p className="text-sm text-red-600 dark:text-red-300">{form.formState.errors.category.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          placeholder="What happened? Why did it feel confusing, surprising, or broken?"
          rows={5}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/60 placeholder:text-muted-foreground focus:ring-2"
          {...form.register("description")}
        />
        {form.formState.errors.description ? (
          <p className="text-sm text-red-600 dark:text-red-300">{form.formState.errors.description.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="sourceUrl" className="text-sm font-medium">
          Source URL (optional)
        </label>
        <input
          id="sourceUrl"
          type="url"
          placeholder="https://example.com/page"
          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-primary/60 placeholder:text-muted-foreground focus:ring-2"
          {...form.register("sourceUrl")}
        />
        {form.formState.errors.sourceUrl ? (
          <p className="text-sm text-red-600 dark:text-red-300">{form.formState.errors.sourceUrl.message}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="images" className="text-sm font-medium">
            Screenshots
          </label>
          <span className="text-xs text-muted-foreground">1-3 images, JPG/PNG/WEBP, up to 8MB each</span>
        </div>
        <label
          htmlFor="images"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground hover:bg-muted"
        >
          <Upload className="h-4 w-4" />
          Select screenshots
        </label>
        <input
          id="images"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(event) => {
            onFilesSelected(event.target.files);
            event.currentTarget.value = "";
          }}
        />

        {images.length ? (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {previews.map((item, index) => (
              <li key={`${item.file.name}-${index}`} className="rounded-xl border border-border bg-background p-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                  <Image src={item.url} alt={item.file.name} fill className="object-cover" unoptimized />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-muted-foreground">{item.file.name}</p>
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {form.formState.errors.images ? (
          <p className="text-sm text-red-600 dark:text-red-300">{form.formState.errors.images.message}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Submit anomaly
        </Button>
      </div>
    </form>
  );
}
