import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";

import { useSignIn } from "@/api/auth";
import { applyFieldErrors, errorMessage } from "@/api/errors";
import { AuthHeading } from "@/components/auth/auth-heading";
import { FormAlert } from "@/components/shared/form-alert";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";
import { signInSchema, type SignInValues } from "@/schemas/auth";

/** Redirecting after success is `RedirectIfAuthed`'s job: it reacts to the cached user. */
export function SignInPage() {
  const [params] = useSearchParams();
  const signIn = useSignIn();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInValues) => {
    setFormError(null);
    try {
      await signIn.mutateAsync(values);
    } catch (err) {
      if (!applyFieldErrors(err, setError, ["email", "password"]))
        setFormError(errorMessage(err));
    }
  };

  return (
    <>
      <title>Sign in · AcadPath</title>
      <AuthHeading
        title="Welcome back"
        description="Sign in to continue planning your semesters."
      />

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-5"
      >
        {formError ? <FormAlert message={formError} /> : null}

        <FormField label="Email" error={errors.email?.message}>
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

        <FormField label="Password" error={errors.password?.message}>
          {(control) => (
            <PasswordInput
              {...control}
              {...register("password")}
              autoComplete="current-password"
              className="h-10"
            />
          )}
        </FormField>

        <Button
          type="submit"
          size="xl"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight data-icon="inline-end" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        New to AcadPath?{" "}
        <Link
          to={{ pathname: ROUTES.signUp, search: params.toString() }}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>

      <p className="mt-2 text-sm text-muted-foreground">
        Administrators sign in here too and go straight to the admin console.
      </p>
    </>
  );
}
