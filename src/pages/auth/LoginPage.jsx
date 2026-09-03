import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import AuthLayout from "@/components/layout/AuthLayout";
import FormField from "@/components/form/FormField";
import Input from "@/components/form/Input";
import Button from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async ({ email, password }) => {
    setFormError(null);
    try {
      const roleName = await login(email, password);
      navigate(`/${roleName.toLowerCase()}/dashboard`, { replace: true });
    } catch (err) {
      setFormError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-center">
        <h1 className="text-2xl tracking-tighter font-bold text-primary">
          Sign in to <span className="text-accent italic">TeamSync</span>
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4" noValidate>
          {formError && (
            <p className="rounded-md border border-red-600 bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
          )}

          <FormField label="Work email" required error={errors.email?.message}>
            <Input type="email" autoComplete="email" placeholder="you@company.com" {...register("email")} />
          </FormField>

          <FormField label="Password" required error={errors.password?.message}>
            <Input type="password" autoComplete="current-password" placeholder="••••••••" {...register("password")} />
          </FormField>

          <Button type="submit" variant="accent" isLoading={isSubmitting} className="mt-2 w-full">
            Sign in
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
