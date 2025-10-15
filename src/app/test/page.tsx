'use client';
import { sbBrowser } from '@/lib/supabase-browser';
import { useEffect } from 'react';

export default function Test() {
  useEffect(() => {
    (async () => {
      const { data, error } = await sbBrowser().from('classes').select('*').limit(1);
      console.log({ data, error });
    })();
  }, []);
  return <div>Check console</div>;
}
