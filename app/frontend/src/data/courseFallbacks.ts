/**
 * Static fallback data used when the backend is unreachable.
 * No React. No API imports. Pure data — safe to import from any layer.
 */
import type { CourseDto, MentorDto } from '../api/types';

export const fallbackCourses: CourseDto[] = [
  {
    id: 'c2b821a8-7fcd-4e8c-8f1b-5e69b0fa6cd2',
    title: 'GenLab Creator Launchpad (Beta)',
    description:
      'Learn essential skills in digital art, design principles, media composition, and audience scaling tailored for Gen Z creators.',
    price: 699.0,
    mentors: [
      { id: '00000000-0000-0000-0000-000000000002', name: 'Anika Sen', email: 'anika.sen@genlab.cc' },
    ],
    syllabus: [
      'Introduction to GenLab Workspace & Tools',
      'Core Aesthetics & Visual Design Principles',
      'Advanced Layout & Vector Graphics Techniques',
      'Audience Dynamics & Content Packaging Strategy',
    ],
    createdAt: '2026-07-01T11:56:39.764325Z',
    isActive: true,
  },
  {
    id: 'course-2',
    title: 'Full Stack Software Development',
    description:
      'Comprehensive software engineering curriculum covering modern frontend React frameworks, Java Spring Boot microservices, and Postgres database architecture.',
    price: 899.0,
    mentors: [{ id: 'mentor-2', name: 'Vikram Malhotra', email: 'vikram.m@genlab.cc' }],
    syllabus: [
      'HTML5, Modern CSS Layouts, & ES6 JavaScript',
      'Vite, React 19, TypeScript, and Zustand State',
      'Backend Web Services with Java 25 & Spring Boot',
      'Supabase CLI, PostgreSQL RLS, & AWS Terraform Deployments',
    ],
    createdAt: '2026-07-01T11:56:39.764325Z',
    isActive: true,
  },
  {
    id: 'course-3',
    title: 'Product Design & Strategy',
    description:
      'Master user research, wireframing, high-fidelity UI layout, interactive prototyping, and project coordination frameworks.',
    price: 599.0,
    mentors: [],
    syllabus: [
      'User Experience (UX) Research & Synthesis',
      'Figma Interface (UI) Design Systems',
      'Interactive High-Fidelity Prototyping',
      'Product-Market Fit & Go-to-Market Strategy',
    ],
    createdAt: '2026-07-01T11:56:39.764325Z',
    isActive: false,
  },
];

export const fallbackMentors: MentorDto[] = [
  { id: '00000000-0000-0000-0000-000000000002', name: 'Anika Sen', email: 'anika.sen@genlab.cc' },
  { id: 'mentor-2', name: 'Vikram Malhotra', email: 'vikram.m@genlab.cc' },
  { id: '00000000-0000-0000-0000-000000000007', name: 'Sarah Connor', email: 'sarah.c@genlab.cc' },
];
