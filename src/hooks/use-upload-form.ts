import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { UploadQueue } from "@/hooks/use-upload-queue";
import {
  createUploadFormSchema,
  type UploadFormValues,
} from "@/schemas/upload";

/**
 * React Hook Form + Zod for an upload step. The selected files live in the shared upload
 * queue (so they survive Back/Continue); they are mirrored into the form's `files` field
 * and validated on submit.
 */
export function useUploadForm(queue: UploadQueue, emptyMessage: string) {
  const schema = useMemo(
    () => createUploadFormSchema(queue.config, emptyMessage),
    [queue.config, emptyMessage],
  );

  const { setValue, clearErrors, formState, handleSubmit } =
    useForm<UploadFormValues>({
      resolver: zodResolver(schema),
      defaultValues: { files: queue.items },
    });

  const { errors } = formState;
  const fileCount = queue.items.length;
  const busy = queue.isSimulating;

  useEffect(() => {
    setValue("files", queue.items);
  }, [queue.items, setValue]);

  // A stale message ("add a file", "wait for files") goes away once the student acts on it;
  // the next Continue re-runs the full schema.
  useEffect(() => {
    clearErrors("files");
  }, [fileCount, busy, clearErrors]);

  const error = errors.files?.message ?? errors.files?.root?.message;

  /** Returns a submit handler that runs `onValid` only when the Zod schema passes. */
  const submit = (onValid: () => void) => handleSubmit(() => onValid());

  return { error, submit };
}
