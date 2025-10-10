'use client';

import { useEffect } from 'react';

export default function SentryTest() {
  useEffect(() => {
    // fire once on mount
    throw new Error('Sentry manual test error');
  }, []);

  return null;
}
