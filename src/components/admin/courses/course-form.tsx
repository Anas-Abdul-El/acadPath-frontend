import { useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormDialogFooter } from "@/components/admin/form-dialog"
import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { COURSE_CATEGORIES, type CourseCategory } from "@/mock/academic/course-catalog"
import type { AdminCourse } from "@/mock/admin/courses"
import type { AdminUniversity } from "@/mock/admin/universities"
import { createCourseSchema, type CourseFormValues } from "@/schemas/admin"

type CourseFormProps = {
  course?: AdminCourse
  /** Pre-selects a university when adding from a filtered list. */
  defaultUniversityId?: string
  universities: AdminUniversity[]
  courses: AdminCourse[]
  onSubmit: (values: CourseFormValues) => void
  onCancel: () => void
}

export function CourseForm({ course, defaultUniversityId, universities, courses, onSubmit, onCancel }: CourseFormProps) {
  const schema = useMemo(() => createCourseSchema(courses, course?.id ?? null), [courses, course?.id])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      universityId: course?.universityId ?? defaultUniversityId ?? "",
      code: course?.code ?? "",
      title: course?.title ?? "",
      description: course?.description ?? "",
      credits: course?.credits ?? 3,
      category: course?.category ?? "major-requirement",
      prerequisites: course?.prerequisites.join(", ") ?? "",
      corequisites: course?.corequisites.join(", ") ?? "",
    },
  })

  const sortedUniversities = [...universities].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 px-5 py-5">
        <FormField label="University" error={errors.universityId?.message}>
          {(control) => (
            <NativeSelect {...control} {...register("universityId")} size="lg" className="w-full">
              <NativeSelectOption value="" disabled>
                Choose a university
              </NativeSelectOption>
              {sortedUniversities.map((university) => (
                <NativeSelectOption key={university.id} value={university.id}>
                  {university.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}
        </FormField>

        <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
          <FormField label="Course code" error={errors.code?.message}>
            {(control) => (
              <Input {...control} {...register("code")} className="h-10 font-mono uppercase" placeholder="CS 3110" autoComplete="off" />
            )}
          </FormField>
          <FormField label="Course name" error={errors.title?.message}>
            {(control) => <Input {...control} {...register("title")} className="h-10" autoComplete="off" />}
          </FormField>
        </div>

        <FormField label="Description" error={errors.description?.message} description="One or two sentences, as in the catalog.">
          {(control) => <Textarea {...control} {...register("description")} rows={3} className="min-h-20 resize-y" />}
        </FormField>

        <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
          <FormField label="Credit hours" error={errors.credits?.message}>
            {(control) => (
              <Input
                {...control}
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
            {(control) => (
              <NativeSelect {...control} {...register("category")} size="lg" className="w-full">
                {(Object.keys(COURSE_CATEGORIES) as CourseCategory[]).map((category) => (
                  <NativeSelectOption key={category} value={category}>
                    {COURSE_CATEGORIES[category].label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Prerequisites" error={errors.prerequisites?.message} description="Course codes, separated by commas.">
            {(control) => (
              <Input {...control} {...register("prerequisites")} className="h-10 font-mono" placeholder="CS 2110, MATH 1210" autoComplete="off" />
            )}
          </FormField>
          <FormField label="Corequisites" error={errors.corequisites?.message} description="Optional.">
            {(control) => (
              <Input {...control} {...register("corequisites")} className="h-10 font-mono" placeholder="—" autoComplete="off" />
            )}
          </FormField>
        </div>
      </div>
      <FormDialogFooter>
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="lg">
          {course ? "Save changes" : "Add course"}
        </Button>
      </FormDialogFooter>
    </form>
  )
}
