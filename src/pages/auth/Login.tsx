import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { AuthHeading } from "@/components/auth/auth-heading";
import { PrototypeNotice } from "@/components/auth/prototype-notice";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/simulation/auth/mock-auth";
import { signIn as startSession } from "@/store/slices/onboarding/onboarding-slice";
import { ROUTES } from "@/lib/routes";
import { signInSchema, type SignInValues } from "@/schemas/auth";
import { useAppDispatch } from "@/store/hooks";

export function SignInPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInValues) => {
    const account = await signIn(values);
    dispatch(startSession(account));
    navigate(ROUTES.app.overview);
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
          to={ROUTES.signUp}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>

      <p className="mt-2 text-sm text-muted-foreground">
        University administrator?{" "}
        <Link
          to={ROUTES.admin.dashboard}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Open the admin console
        </Link>
      </p>

      <PrototypeNotice className="mt-8">
        Sign-in is simulated — no account is checked and nothing is sent to a
        server. Any valid email and password will continue.
      </PrototypeNotice>
    </>
  );
}
