import React from 'react';
import '../index.css';

/**
 * Root layout component that wraps page content in a complete HTML document and applies global layout and theme classes.
 *
 * @returns A JSX element with an `<html lang="en">` root and a `<body>` element containing the provided `children`; the `<body>` includes predefined utility classes for sizing, typography, color themes, and transitions.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
