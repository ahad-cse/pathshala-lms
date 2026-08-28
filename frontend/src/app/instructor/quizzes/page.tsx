'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToInstructorCourses() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/instructor/courses');
  }, [router]);

  return null;
}
