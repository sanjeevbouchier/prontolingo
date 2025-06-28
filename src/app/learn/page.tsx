"use client";

import { Suspense } from 'react';
import { LearnView } from '@/components/learn-view';
import { Loader2 } from 'lucide-react';

function LearnPageContent() {
  return <LearnView />;
}

export default function LearnPage() {
  return (
    <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }>
      <LearnPageContent />
    </Suspense>
  );
}
