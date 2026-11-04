"use client";

import axios from "axios";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface ActionState {
  success: boolean;
  error: string | null;
}

async function handleRegister(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password || !confirmPassword) {
    return { success: false, error: "Please fill in all required fields!" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match!" };
  }

  try {
    const response = await axios.post("/api/auth/register", {
      email,
      password,
    });

    if (response.status === 201 || response.status === 200) {
      return { success: true, error: null };
    }

    return { success: false, error: "Registration failed." };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || "Registration failed!";
      return { success: false, error: errorMessage };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}

const RegisterPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(handleRegister, {
    success: false,
    error: null,
  });

  useEffect(() => {
    if (state.success) {
      toast.success("Account created successfully!");
      router.push("/login");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 overflow-hidden">
      {/* Ambient background glow accents */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

      {/* Main Glassmorphism Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-slate-700/80">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Create Account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Join us to start managing your media seamlessly
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          {/* Email Field */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              disabled={isPending}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-inner transition-all duration-200 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isPending}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-4 pr-11 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-inner transition-all duration-200 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Confirm Password
            </label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isPending}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-4 pr-11 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-inner transition-all duration-200 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-600 bg-size-[200%_auto] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:bg-position-[right_center] hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] disabled:scale-100 disabled:opacity-60 disabled:shadow-none"
          >
            {/* Glossy sheen reflection on hover */}
            <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Creating account...
              </span>
            ) : (
              <span className="relative flex items-center justify-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-1 flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="absolute bg-slate-900/80 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Or
            </span>
          </div>

          {/* Google Sign In Button */}
          <div className="relative w-full">
            {/* Recommended Badge */}
            <span className="absolute -top-2.5 right-3 z-10 rounded-full bg-linear-to-r from-blue-500 to-indigo-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-500/30 ring-1 ring-white/20">
              Recommended
            </span>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 hover:text-white active:scale-[0.98]"
            >
              <FcGoogle className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              Continue with Google
            </button>
          </div>

          {/* Login Link */}
          <p className="mt-2 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-400 transition-colors duration-200 hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
