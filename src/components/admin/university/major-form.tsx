import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { useSaveMajor } from "@/api/admin"
import { applyFieldErrors, errorMessage, isApiError } from "@/api/errors"
import type { DegreeType, MajorDto } from "@/api/types"
import { FormDialogFooter } from "@/components/admin/form-dialog"
import { FormAlert } from "@/components/shared/form-alert"
import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { DEGREE_LABEL } from "@/lib/labels"
import { majorFormSchema, type MajorFormValues } from "@/schemas/admin"

const DEGREES = Object.keys(DEGREE_LABEL) as DegreeType[]

type MajorFormProps = {
  universityId: string
  major?: MajorDto
  onSaved: (major: MajorDto) => void
  onCancel: () => void
}

export function MajorForm({ universityId, major, onSaved, onCancel }: MajorFormProps) {
  const save = useSaveMajor()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MajorFormValues>({
    resolver: zodResolver(majorFormSchema),
    mode: "onTouched",
    defaultValues: {
      name: major?.name ?? "",
      degreeType: major?.degreeType ?? "BACHELOR",
      totalRequiredCredits: major?.totalRequiredCredits?.toString() ?? "",
    },
  })

  const onSubmit = async (values: MajorFormValues) => {
    setFormError(null)
    try {
      const saved = await save.mutateAsync({
        universityId,
        majorId: major?.id,
        body: {
          name: values.name,
          degreeType: values.degreeType,
          totalRequiredCredits: values.totalRequiredCredits ? Number(values.totalRequiredCredits) : null,
        },
      })
      onSaved(saved)
    } catch (err) {
      if (isApiError(err, 409)) setError("name", { type: "server", message: err.message })
      else if (!applyFieldErrors(err, setError, ["name", "degreeType", "totalRequiredCredits"]))
        setFormError(errorMessage(err))
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 px-5 py-5">
        {formError ? <FormAlert message={formError} /> : null}
        <FormField label="Major name" error={errors.name?.message}>
          {(control) => (
            <Input {...control} {...register("name")} className="h-10" placeholder="e.g. Computer Science" autoComplete="off" />
          )}
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Degree" error={errors.degreeType?.message}>
            {(control) => (
              <NativeSelect {...control} {...register("degreeType")} size="lg" className="w-full">
                {DEGREES.map((degree) => (
                  <NativeSelectOption key={degree} value={degree}>
                    {DEGREE_LABEL[degree]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </FormField>
          <FormField
            label="Credits to graduate"
            error={errors.totalRequiredCredits?.message}
            description="Optional"
          >
            {(control) => (
              <Input
                {...control}
                {...register("totalRequiredCredits")}
                inputMode="numeric"
                className="h-10"
                placeholder="e.g. 128"
              />
            )}
          </FormField>
        </div>
      </div>
      <FormDialogFooter>
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : major ? "Save changes" : "Add major"}
        </Button>
      </FormDialogFooter>
    </form>
  )
}
