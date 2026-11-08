import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"

import { useAdminMajors, useSaveCourse, useUniversityOptions } from "@/api/admin"
import { applyFieldErrors, errorMessage, isApiError } from "@/api/errors"
import type { AdminCourseDto, Term } from "@/api/types"
import { FormDialogFooter } from "@/components/admin/form-dialog"
import { FormAlert } from "@/components/shared/form-alert"
import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORY_ORDER, categoryLabel, DEGREE_LABEL, TERM_LABEL } from "@/lib/labels"
import { courseFormSchema, normalizeCode, parseCodeList, type CourseFormValues } from "@/schemas/admin"

const TERMS: Term[] = ["FALL", "SPRING", "SUMMER"]
const SERVER_FIELDS = [
  "majorId",
  "code",
  "name",
  "description",
  "credits",
  "category",
  "offeredTerms",
  "prerequisites",
  "corequisites",
] as const

type CourseFormProps = {
  course?: AdminCourseDto
  /** Pre-selects a university (and major) when adding from a filtered list. */
  defaultUniversityId?: string
  defaultMajorId?: string
  onSaved: (course: AdminCourseDto) => void
  onCancel: () => void
}

export function CourseForm({ course, defaultUniversityId, defaultMajorId, onSaved, onCancel }: CourseFormProps) {
  const save = useSaveCourse()
  const universities = useUniversityOptions()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    mode: "onTouched",
    defaultValues: {
      universityId: course?.university.id ?? defaultUniversityId ?? "",
      majorId: course?.major.id ?? defaultMajorId ?? "",
      code: course?.code ?? "",
      name: course?.name ?? "",
      description: course?.description ?? "",
      credits: course?.credits ?? 3,
      category: course?.category ?? "MAJOR_REQUIREMENT",
      offeredTerms: course?.offeredTerms ?? ["FALL", "SPRING"],
      prerequisites: course?.prerequisites.map((c) => c.code).join(", ") ?? "",
      corequisites: course?.corequisites.map((c) => c.code).join(", ") ?? "",
    },
  })

  const universityId = useWatch({ control, name: "universityId" })
  const majors = useAdminMajors(universityId || null)
  const universityOptions = universities.data?.data ?? []

  const onSubmit = async (values: CourseFormValues) => {
    setFormError(null)
    try {
      const saved = await save.mutateAsync({
        id: course?.id,
        body: {
          majorId: values.majorId,
          code: normalizeCode(values.code),
          name: values.name.trim(),
          description: values.description.trim(),
          credits: values.credits,
          category: values.category,
          offeredTerms: values.offeredTerms,
          prerequisites: parseCodeList(values.prerequisites),
          corequisites: parseCodeList(values.corequisites),
        },
      })
      onSaved(saved)
    } catch (err) {
      if (isApiError(err, 409)) setError("code", { type: "server", message: err.message })
      else if (isApiError(err, 404)) setError("majorId", { type: "server", message: err.message })
      else if (!applyFieldErrors(err, setError, SERVER_FIELDS)) setFormError(errorMessage(err))
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 px-5 py-5">
        {formError ? <FormAlert message={formError} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="University" error={errors.universityId?.message}>
            {(field) => (
              <NativeSelect
                {...field}
                {...register("universityId", {
                  // Majors belong to one university, so a new university means picking a major again.
                  onChange: () => setValue("majorId", ""),
                })}
                size="lg"
                className="w-full"
                disabled={universities.isPending}
              >
                <NativeSelectOption value="" disabled>
                  {universities.isPending ? "Loading…" : "Choose a university"}
                </NativeSelectOption>
                {universityOptions.map((university) => (
                  <NativeSelectOption key={university.id} value={university.id}>
                    {university.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormField>
          <FormField
            label="Major"
            error={errors.majorId?.message}
            description={
              universityId && majors.data?.length === 0 ? "Add a major from the university's details first." : undefined
            }
          >
            {(field) => (
              <NativeSelect
                {...field}
                {...register("majorId")}
                size="lg"
                className="w-full"
                disabled={!universityId || majors.isPending}
              >
                <NativeSelectOption value="" disabled>
                  {!universityId ? "Choose a university first" : majors.isPending ? "Loading…" : "Choose a major"}
                </NativeSelectOption>
                {(majors.data ?? []).map((major) => (
                  <NativeSelectOption key={major.id} value={major.id}>
                    {major.name} ({DEGREE_LABEL[major.degreeType]})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
          <FormField label="Course code" error={errors.code?.message}>
            {(field) => (
              <Input {...field} {...register("code")} className="h-10 font-mono uppercase" placeholder="CS 3110" autoComplete="off" />
            )}
          </FormField>
          <FormField label="Course name" error={errors.name?.message}>
            {(field) => <Input {...field} {...register("name")} className="h-10" autoComplete="off" />}
          </FormField>
        </div>

        <FormField label="Description" error={errors.description?.message} description="One or two sentences, as in the catalog.">
          {(field) => <Textarea {...field} {...register("description")} rows={3} className="min-h-20 resize-y" />}
        </FormField>

        <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
          <FormField label="Credit hours" error={errors.credits?.message}>
            {(field) => (
              <Input
                {...field}
                {...register("credits", { valueAsNumber: true })}
                type="number"
                min={0}
                max={8}
                step={1}
                inputMode="numeric"
                className="h-10"
              />
            )}
          </FormField>
          <FormField label="Category" error={errors.category?.message}>
            {(field) => (
              <NativeSelect {...field} {...register("category")} size="lg" className="w-full">
                {CATEGORY_ORDER.map((category) => (
                  <NativeSelectOption key={category} value={category}>
                    {categoryLabel(category)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormField>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-foreground">Offered</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TERMS.map((term) => (
              <label
                key={term}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/40"
              >
                <input type="checkbox" value={term} {...register("offeredTerms")} className="size-3.5 accent-primary" />
                {TERM_LABEL[term]}
              </label>
            ))}
          </div>
          {errors.offeredTerms ? (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {errors.offeredTerms.message}
            </p>
          ) : null}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Prerequisites"
            error={errors.prerequisites?.message}
            description="Course codes in the same major, separated by commas."
          >
            {(field) => (
              <Input {...field} {...register("prerequisites")} className="h-10 font-mono" placeholder="CS 2110, MATH 1210" autoComplete="off" />
            )}
          </FormField>
          <FormField label="Corequisites" error={errors.corequisites?.message} description="Optional.">
            {(field) => (
              <Input {...field} {...register("corequisites")} className="h-10 font-mono" placeholder="—" autoComplete="off" />
            )}
          </FormField>
        </div>
      </div>
      <FormDialogFooter>
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : course ? "Save changes" : "Add course"}
        </Button>
      </FormDialogFooter>
    </form>
  )
}
