import type { Ref } from "react";

import { FormField } from "@/components/shared/form-field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  academicYears,
  NEW_STUDENT_YEAR,
  type AcademicYear,
} from "@/data/academic-years";

type AcademicYearFieldProps = {
  value: AcademicYear | null;
  onChange: (year: AcademicYear) => void;
  error?: string;
  selectRef?: Ref<HTMLSelectElement>;
};

/** Year-of-study picker for the transcript step; "New student" means there's nothing to upload. */
export function AcademicYearField({
  value,
  onChange,
  error,
  selectRef,
}: AcademicYearFieldProps) {
  return (
    <FormField
      label="Year at university"
      description={
        value === NEW_STUDENT_YEAR
          ? "No transcript needed — you'll start with a 0.00 GPA."
          : "Choose “New student” if this is your first term."
      }
      error={error}
      className="max-w-sm"
    >
      {(control) => (
        <NativeSelect
          {...control}
          ref={selectRef}
          name="academicYear"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value as AcademicYear)}
          size="lg"
          className="w-full"
        >
          <NativeSelectOption value="" disabled>
            Select your year
          </NativeSelectOption>
          {academicYears.map((year) => (
            <NativeSelectOption key={year.id} value={year.id}>
              {year.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      )}
    </FormField>
  );
}
