import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormDialogFooter } from "@/components/admin/form-dialog"
import { FormField } from "@/components/shared/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AdminUniversity } from "@/mock/admin/universities"
import { adminUniversitySchema, type AdminUniversityValues } from "@/schemas/admin"

type UniversityFormProps = {
  university?: AdminUniversity
  onSubmit: (values: AdminUniversityValues) => void
  onCancel: () => void
}

export function UniversityForm({ university, onSubmit, onCancel }: UniversityFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminUniversityValues>({
    resolver: zodResolver(adminUniversitySchema),
    mode: "onTouched",
    defaultValues: {
      name: university?.name ?? "",
      shortName: university?.shortName ?? "",
      country: university?.country ?? "",
      city: university?.city ?? "",
      website: university?.website ?? "",
      catalogYear: university?.catalogYear ?? "",
    },
  })

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <FormField label="University name" error={errors.name?.message}>
            {(control) => <Input {...control} {...register("name")} className="h-10" autoComplete="off" />}
          </FormField>
          <FormField label="Abbreviation" error={errors.shortName?.message} description="Optional">
            {(control) => <Input {...control} {...register("shortName")} className="h-10" placeholder="e.g. UJ" />}
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Country" error={errors.country?.message}>
            {(control) => <Input {...control} {...register("country")} className="h-10" />}
          </FormField>
          <FormField label="City" error={errors.city?.message}>
            {(control) => <Input {...control} {...register("city")} className="h-10" />}
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <FormField label="Catalog website" error={errors.website?.message} description="Optional — where the public course catalog lives.">
            {(control) => (
              <Input {...control} {...register("website")} type="url" inputMode="url" className="h-10" placeholder="https://catalog.example.edu" />
            )}
          </FormField>
          <FormField label="Catalog year" error={errors.catalogYear?.message} description="Optional, e.g. 2025–26">
            {(control) => <Input {...control} {...register("catalogYear")} className="h-10" />}
          </FormField>
        </div>
      </div>
      <FormDialogFooter>
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="lg">
          {university ? "Save changes" : "Add university"}
        </Button>
      </FormDialogFooter>
    </form>
  )
}
