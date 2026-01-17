// frontend/app/create-team/page.js
'use client';

import { Suspense } from 'react';
import CreateTeamContent from './CreateTeamContent';

export default function CreateTeam() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4">Loading...</div>}>
      <CreateTeamContent />
    </Suspense>
  );
}
