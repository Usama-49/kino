"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Film, Upload, LogIn, LogOut, User } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 md:px-8">
        {/* Left Side: Brand Logo (Redirects to /) */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-transform duration-200 active:scale-95"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-transparent border border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-500/10 group-hover:border-indigo-400/60 group-hover:bg-indigo-500/30 group-hover:shadow-indigo-500/25 transition-all duration-300">
            <Film className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Kino<span className="text-indigo-500">.</span>
          </span>
        </Link>

        {/* Right Side: Navigation & Actions */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {/* Upload Link */}
          <Link
            href="/upload"
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition-all duration-200 border ${
              isActive("/upload")
                ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300 shadow-inner"
                : "border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 hover:border-slate-800"
            }`}
          >
            <Upload className="h-4 w-4 shrink-0" />
            <span>Upload</span>
          </Link>

          <div className="h-4 w-px bg-slate-800/80 my-auto mx-1" />

          {/* User Session Condition: Login / Logout */}
          {status === "loading" ? (
            <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-800/50" />
          ) : session ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* User Email Badge */}
              {session.user?.email && (
                <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300">
                  <User className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="max-w-[120px] truncate">{session.user.email}</span>
                </div>
              )}

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-all duration-200 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 active:scale-95 cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Sign In Button */
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:from-indigo-500 hover:to-blue-500 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:scale-95"
            >
              <LogIn className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
              <span>Sign In</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
