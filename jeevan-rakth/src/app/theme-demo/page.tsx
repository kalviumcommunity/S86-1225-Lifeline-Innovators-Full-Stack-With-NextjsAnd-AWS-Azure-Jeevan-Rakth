"use client";

import React from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function ResponsiveThemePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header with Theme Toggle */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-brand">
              Responsive Theme Demo
            </h1>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8 lg:p-12">
        {/* Hero Section */}
        <section className="mb-8 md:mb-12 lg:mb-16">
          <div className="rounded-lg bg-linear-to-r from-brand-light to-brand-dark p-6 md:p-10 lg:p-14 text-white shadow-xl">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
              Welcome to Jeevan Rakth
            </h2>
            <p className="text-base md:text-lg lg:text-xl max-w-3xl">
              Experience responsive design with custom Tailwind configuration
              featuring brand colors, custom breakpoints, and seamless theme
              switching.
            </p>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="mb-8 md:mb-12">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-6 md:mb-8">
            Responsive Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* Card 1 */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand-dark text-xl font-bold">
                1
              </div>
              <h4 className="text-lg md:text-xl font-semibold mb-2 text-brand-dark dark:text-brand-light">
                Custom Breakpoints
              </h4>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Configured breakpoints: sm (640px), md (768px), lg (1024px), xl
                (1280px)
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white text-xl font-bold">
                2
              </div>
              <h4 className="text-lg md:text-xl font-semibold mb-2 text-brand-dark dark:text-brand-light">
                Brand Colors
              </h4>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Custom brand palette with light (#93C5FD), default (#3B82F6),
                and dark (#1E40AF)
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-dark text-white text-xl font-bold">
                3
              </div>
              <h4 className="text-lg md:text-xl font-semibold mb-2 text-brand-dark dark:text-brand-light">
                Dark Mode
              </h4>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Seamless theme switching with localStorage persistence and
                system preference detection
              </p>
            </div>
          </div>
        </section>

        {/* Responsive Text Demo */}
        <section className="mb-8 md:mb-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 md:p-8 lg:p-10">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
            Responsive Typography
          </h3>
          <div className="space-y-4">
            <p className="text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-400">
              <strong>Extra Small to Base:</strong> This text scales from xs on
              mobile to base on large screens
            </p>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400">
              <strong>Small to Large:</strong> This text scales from sm on
              mobile to lg on large screens
            </p>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
              <strong>Base to Extra Large:</strong> This text scales from base
              on mobile to xl on large screens
            </p>
          </div>
        </section>

        {/* Color Palette Display */}
        <section className="mb-8 md:mb-12">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-6 md:mb-8">
            Brand Color Palette
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center">
              <div className="h-24 md:h-32 lg:h-40 w-full rounded-lg bg-brand-light shadow-md mb-3"></div>
              <p className="font-mono text-sm md:text-base text-gray-700 dark:text-gray-300">
                brand-light
              </p>
              <p className="font-mono text-xs md:text-sm text-gray-500 dark:text-gray-500">
                #93C5FD
              </p>
            </div>
            <div className="text-center">
              <div className="h-24 md:h-32 lg:h-40 w-full rounded-lg bg-brand shadow-md mb-3"></div>
              <p className="font-mono text-sm md:text-base text-gray-700 dark:text-gray-300">
                brand
              </p>
              <p className="font-mono text-xs md:text-sm text-gray-500 dark:text-gray-500">
                #3B82F6
              </p>
            </div>
            <div className="text-center">
              <div className="h-24 md:h-32 lg:h-40 w-full rounded-lg bg-brand-dark shadow-md mb-3"></div>
              <p className="font-mono text-sm md:text-base text-gray-700 dark:text-gray-300">
                brand-dark
              </p>
              <p className="font-mono text-xs md:text-sm text-gray-500 dark:text-gray-500">
                #1E40AF
              </p>
            </div>
          </div>
        </section>

        {/* Responsive Padding Demo */}
        <section className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="p-2 md:p-4 lg:p-6 bg-brand-light/20 dark:bg-brand-dark/20">
            <p className="text-xs md:text-sm lg:text-base font-semibold text-center text-brand-dark dark:text-brand-light">
              Padding: p-2 (mobile) → p-4 (tablet) → p-6 (desktop)
            </p>
          </div>
          <div className="p-4 md:p-8 lg:p-12 bg-brand/10 dark:bg-brand/20">
            <p className="text-xs md:text-sm lg:text-base font-semibold text-center text-brand-dark dark:text-brand-light">
              Padding: p-4 (mobile) → p-8 (tablet) → p-12 (desktop)
            </p>
          </div>
        </section>

        {/* Accessibility Note */}
        <section className="mt-8 md:mt-12 rounded-lg border-l-4 border-brand bg-brand-light/10 dark:bg-brand-dark/10 p-4 md:p-6">
          <h4 className="text-lg md:text-xl font-semibold mb-2 text-brand-dark dark:text-brand-light">
            ♿ Accessibility Considerations
          </h4>
          <ul className="space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
            <li>
              ✅ Color contrast ratios meet WCAG AA standards in both themes
            </li>
            <li>
              ✅ Theme preference persists across sessions via localStorage
            </li>
            <li>✅ Respects system color scheme preferences</li>
            <li>✅ Focus indicators visible on interactive elements</li>
            <li>✅ Smooth transitions prevent jarring theme changes</li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-8">
          <p className="text-center text-sm md:text-base text-gray-600 dark:text-gray-400">
            Resize your browser or use DevTools to see responsive breakpoints in
            action
          </p>
        </div>
      </footer>
    </div>
  );
}
