'use client';

import * as Sentry from '@sentry/nextjs';

export default function SentryExamplePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Sentry example page</h1>
      <p>Click to send a test error to Sentry.</p>
      <button
        onClick={() => {
          try {
            // force an error
            // @ts-expect-error
            myUndefinedFunction();
          } catch (e) {
            Sentry.captureException(e);
            throw e; // also surfaces in console
          }
        }}
        style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}
      >
        Trigger test error
      </button>
    </main>
  );
}
