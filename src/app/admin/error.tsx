'use client';
import { Shell, Card, CardBody, Button } from '@/components/ui';

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error)
  return (
    <Shell title="Error">
      <Card><CardBody>
        <h1 className="text-lg font-semibold mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-600 mb-4">{error.message || 'Unexpected error.'}</p>
        <Button onClick={() => reset()}>Try again</Button>
      </CardBody></Card>
    </Shell>
  );
}