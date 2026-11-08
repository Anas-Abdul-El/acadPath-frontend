import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useSearchParams } from "react-router-dom"

import { useRegister } from "@/api/auth"
import { applyFieldErrors, errorMessage, isApiError } from "@/api/errors"
import { AuthHeading } from "@/components/auth/auth-heading"
import { FormAlert } from "@/components/shared/form-alert"
import { FormField } from "@/components/shared/form-field"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ROUTES } from "@/lib/routes"
import {
  PASSWORD_MIN_LENGTH,
  signUpSchema,
  type SignUpValues,
} from "@/schemas/auth"

/** After success, `RedirectIfAuthed` sends the new student to the first onboarding step. */
export function SignUpPage() {
  const [params] = useSearchParams()
  const registerAccount = useRegister()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "" },
  })

  const onSubmit = async (values: SignUpValues) => {
    setFormError(null)
    try {
      await registerAccount.mutateAsync(values)
    } catch (err) {
      if (isApiError(err, 409)) setError("email", { type: "server", message: err.message })
      else if (!applyFieldErrors(err, setError, ["name", "email", "password"])) setFormError(errorMessage(err))
    }
  }

  return (
    <>
      <title>Create your account · AcadPath</title>
      <AuthHeading
        title="Create your account"
        description="Start with the basics. Next, we'll find your university and degree requirements."
      />

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        {formError ? <FormAlert message={formError} /> : null}

        <FormField label="Full name" error={errors.name?.message}>
          {(control) => <Input {...control} {...register("name")} autoComplete="name" className="h-10" />}
        </FormField>

        <FormField
          label="Email"
          description="Your university email works best, but any address is fine."
          error={errors.email?.message}
        >
          {(control) => (
            <Input
              {...control}
              {...register("email")}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="name@university.edu"
              className="h-10"
            />
          )}
        </FormField>

        <FormField
          label="Password"
          description={`At least ${PASSWORD_MIN_LENGTH} characters, including a letter and a number.`}
          error={errors.password?.message}
        >
          {(control) => (
            <PasswordInput
              {...control}
              {...register("password")}
              autoComplete="new-password"
              className="h-10"
            />
          )}
        </FormField>

        <Button type="submit" size="xl" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight data-icon="inline-end" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to={{ pathname: ROUTES.signIn, search: params.toString() }} className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
