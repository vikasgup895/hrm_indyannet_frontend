"use client";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for diagnostics (kept in production)
    console.error("App Error:", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">
            We hit an unexpected error. Please try again.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Try again
            </button>
            <a
              href="/"
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
