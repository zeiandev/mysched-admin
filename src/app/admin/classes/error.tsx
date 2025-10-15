// src/app/admin/classes/error.tsx
'use client'

import { Shell, Card, CardBody, Button } from '@/components/ui'

export default function ClassesError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  console.error(error)

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Shell title="Classes Error">
          <Card>
            <CardBody>
              <div className="text-center">
                <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 110 20 10 10 0 010-20z"
                    />
                  </svg>
                </div>

                <h1 className="text-lg font-semibold text-gray-900 mb-1">
                  Failed to load Classes
                </h1>
                <p className="text-sm text-gray-600 mb-5">
                  {error.message || 'An unexpected error occurred.'}
                </p>

                <Button
                  onClick={() => reset()}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Try again
                </Button>
              </div>
            </CardBody>
          </Card>
        </Shell>
      </div>
    </main>
  )
}
