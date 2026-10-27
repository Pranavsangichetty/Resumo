"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        setIsLoggedIn(true);
      }
    } catch {}
  }, []);

  const destinationHref = isLoggedIn ? "/dashboard" : "/register";

  return (
    <main className="relative w-full h-screen min-h-[100vh] h-[100svh] overflow-hidden m-0 p-0 bg-[#090a0f]">
      {/* ── Top Navigation Overlay ── */}
      <header className="absolute top-0 left-0 right-0 z-20 w-full px-3 sm:px-6 md:px-10 py-3 sm:py-5 flex items-center justify-between pointer-events-auto">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-2.5 bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-xl sm:rounded-2xl border border-white/10 shadow-lg hover:border-white/20 transition"
        >
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-extrabold text-sm sm:text-base">
            R
          </div>
          <div>
            <b className="text-sm sm:text-base font-bold tracking-tight text-white leading-none block">
              Resumo
            </b>
            <span className="hidden sm:block text-[9px] text-zinc-300 uppercase tracking-wider font-semibold leading-none mt-0.5">
              Craft Better. Apply Smarter.
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2.5 bg-black/45 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl border border-white/10 shadow-lg">
          <Link
            href="/about"
            className="px-2.5 py-1 text-xs font-semibold text-zinc-200 transition hover:text-white"
          >
            About
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-lg sm:rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1 text-xs font-semibold text-white transition shadow-[0_0_12px_rgba(99,102,241,0.4)]"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg sm:rounded-xl border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20 hover:border-white/25"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg sm:rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1 text-xs font-semibold text-white transition shadow-[0_0_12px_rgba(99,102,241,0.4)]"
              >
                Get Started →
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ── Full-Bleed Edge-to-Edge Thumbnail ── */}
      <Link
        href={destinationHref}
        className="absolute inset-0 z-10 w-full h-full cursor-pointer block"
        aria-label="Build Your Dream Career with Resumo"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/thumbnail.jpg"
          alt="Resumo - Build Your Dream Career"
          className="w-full h-full object-cover object-center select-none"
          loading="eager"
        />
      </Link>
    </main>
  );
}
