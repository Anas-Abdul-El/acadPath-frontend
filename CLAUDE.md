# AcadPath — Project Instructions

## 1. Project Overview

AcadPath is an AI-powered university academic planning platform for university students.

It helps students plan their academic journey, explore course information, understand the impact of different course choices, and find learning resources for difficult or failed courses.

The platform has two roles:

- Student
- Admin

Build the frontend as a polished, realistic university SaaS product, not a generic AI-generated dashboard.

## 2. Tech Stack

- react app with React Router
- TypeScript
- Tailwind CSS
- shadcn/ui for reusable UI components
- Lucide React for icons
- Recharts for charts and data visualizations
- Motion for React for animations when they improve the experience

Use the existing project setup whenever possible. Do not replace working dependencies or configuration without a good reason.

## 3. Design Direction

Create a modern, premium, clean, and professional academic platform.

Design principles:

- Avoid generic AI-dashboard designs and excessive gradients.
- Use a consistent color palette, typography, spacing, and border radius.
- Establish clear visual hierarchy and strong readability.
- Use whitespace intentionally; avoid cluttered layouts.
- Use subtle shadows, borders, and restrained animations.
- Make layouts responsive for desktop, tablet, and mobile.
- Use realistic university data instead of repetitive placeholder text.
- Ensure every page feels like part of the same product.

Create a consistent design system with reusable colors, typography, spacing, buttons, cards, forms, and navigation.

## 4. Implementation Rules

- Use TypeScript and avoid `any` unless absolutely necessary.
- Build reusable components instead of duplicating UI.
- Keep components organized and maintainable.
- Use semantic HTML and accessible controls.
- Handle loading, empty, error, and success states where appropriate.
- Ensure buttons, forms, filters, tabs, and navigation behave realistically.
- Do not add unnecessary dependencies.
- Avoid putting the entire page into one large component.
- Keep mock data separate from UI components.
- Do not implement backend functionality unless explicitly requested.

## 5. Shared Layout

Use a consistent application layout across authenticated pages.

Include:

- A reusable sidebar for primary navigation.
- A clear page header with a title and helpful description.
- Consistent content width and spacing.
- Reusable cards, badges, tables, dialogs, and form controls.

Navigation and layout should remain consistent between pages.

## 6. Core Student Features

The student experience may include:

- Overview dashboard
- Academic profile and GPA
- Semester planning
- What-if analysis
- Full academic plan through graduation
- Course information and exploration
- Failed-course and course-based learning recommendations
- AI-powered search for learning resources
- Learning resources from platforms such as YouTube, Udemy, and Coursera
- AI-generated quizzes to evaluate understanding

The admin experience should support the management of relevant platform data and content.

Implement only the pages and features requested for the current task.

## 7. Workflow

Before implementing a page:

1. Inspect the existing codebase and understand its structure.
2. Reuse the established design system and existing components.
3. Plan the page layout before coding.
4. Build the page with realistic sample data.
5. Check responsive behavior and visual consistency.
6. Fix obvious layout, spacing, and interaction issues.

Do not redesign unrelated pages when working on a specific page.

## 8. Important Constraints

- Prioritize visual quality and consistency.
- Do not invent complex functionality beyond the current requirements.
- Do not introduce a backend or database unless requested.
- Do not use arbitrary colors or inconsistent styling between pages.
- Keep the implementation easy to connect to a future API.
- If a requirement is unclear, ask before making major architectural decisions.

## Skills and Libraries

- Follow the installed frontend-design skill when designing UI.
- Follow vercel-react-best-practices when implementing React components.
- Use shadcn/ui for reusable UI components.
- Use Lucide React for icons.
- Use Recharts for charts and data visualizations.
- Use Motion only when animations improve the user experience.
- Before adding dependencies, inspect package.json and reuse
  existing libraries whenever possible.
- Do not install duplicate or unnecessary packages.
