import { useMemo } from "react";
import { SearchX, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { useMyCourses } from "@/api/academics";
import { useCurrentUser } from "@/api/me";
import type {
  CourseCategory,
  MyCourseDto,
  StudentCourseStatus,
} from "@/api/types";
import { AppPageHeader } from "@/components/shared/page-header";
import { QueryError, Skeleton } from "@/components/shared/query-state";
import { CourseCard } from "@/components/webApp/courses/course-card";
import { FilterChips } from "@/components/webApp/courses/filter-chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pluralize } from "@/lib/files/format";
import {
  CATEGORY_ORDER,
  categoryLabel,
  COURSE_STATUS_LABEL,
  enumToParam,
  majorLabel,
  paramToEnum,
} from "@/lib/labels";

const STATUS_ORDER: StudentCourseStatus[] = [
  "NOT_TAKEN",
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
];
const STATUS_OPTIONS = [
  { value: "all", label: "Any status" },
  ...STATUS_ORDER.map((value) => ({
    value: enumToParam(value),
    label: COURSE_STATUS_LABEL[value],
  })),
];

/** Lowercase with spaces and punctuation removed, so "cs3110" finds "CS 3110". */
const compact = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

function matchesQuery(course: MyCourseDto, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    compact(course.code).includes(compact(needle)) ||
    course.name.toLowerCase().includes(needle) ||
    Boolean(course.description?.toLowerCase().includes(needle))
  );
}

export function CoursesPage() {
  // Filters live in the URL so results are shareable and other pages can link here.
  const [params, setParams] = useSearchParams();
  const { profile } = useCurrentUser();
  const courses = useMyCourses();
  const query = params.get("q") ?? "";
  const category = paramToEnum<CourseCategory>(
    params.get("category"),
    CATEGORY_ORDER,
  );
  const status = paramToEnum<StudentCourseStatus>(
    params.get("status"),
    STATUS_ORDER,
  );

  const update = (key: "q" | "category" | "status", value: string) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (!value || value === "all") next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  };

  const allCourses = courses.data;
  const matchingQuery = useMemo(
    () => (allCourses ?? []).filter((course) => matchesQuery(course, query)),
    [allCourses, query],
  );
  const results = useMemo(
    () =>
      matchingQuery.filter(
        (course) =>
          (category === null || course.category === category) &&
          (status === null || course.status === status),
      ),
    [matchingQuery, category, status],
  );

  const categoryOptions = [
    { value: "all", label: "All", count: matchingQuery.length },
    ...CATEGORY_ORDER.map((key) => ({
      value: enumToParam(key),
      label: categoryLabel(key),
      count: matchingQuery.filter((course) => course.category === key).length,
    })),
  ];
  const hasFilters = Boolean(query) || category !== null || status !== null;

  const university = profile?.university;
  const major = profile?.major;
  const description = [
    allCourses ? pluralize(allCourses.length, "course") : "Courses",
    major ? ` in ${majorLabel(major)}` : "",
    university ? ` at ${university.name}` : "",
    university?.catalogYear ? ` (${university.catalogYear} catalog)` : "",
    ".",
  ].join("");

  return (
    <div className="space-y-6">
      <title>Courses · AcadPath</title>
      <AppPageHeader title="Courses" description={description} />

      <section
        aria-label="Filter courses"
        className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-5"
      >
        <div className="relative max-w-xl">
          <label htmlFor="course-search" className="sr-only">
            Search by course code or name
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="course-search"
            type="search"
            value={query}
            onChange={(event) => update("q", event.target.value)}
            placeholder="Search by code or name — e.g. CS 3110 or databases"
            className="h-10 pr-10 pl-9"
          />
          {query ? (
            <button
              type="button"
              onClick={() => update("q", "")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="space-y-3">
          <FilterChips
            label="Category"
            options={categoryOptions}
            value={category ? enumToParam(category) : "all"}
            onChange={(value) => update("category", value)}
          />
          <FilterChips
            label="Status"
            options={STATUS_OPTIONS}
            value={status ? enumToParam(status) : "all"}
            onChange={(value) => update("status", value)}
          />
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {pluralize(results.length, "course")}
          </span>
          {query ? <> for “{query}”</> : null}
        </p>
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setParams({}, { replace: true })}
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      {courses.isPending ? (
        <div
          role="status"
          aria-label="Loading courses"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-52 rounded-lg" />
          ))}
        </div>
      ) : courses.error ? (
        <QueryError
          error={courses.error}
          onRetry={() => courses.refetch()}
          title="We couldn't load your courses"
        />
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {results.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelectCode={(code) => {
                setParams({ q: code }, { replace: true });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card/60 px-6 py-14 text-center">
          <SearchX
            aria-hidden="true"
            className="size-8 text-muted-foreground"
          />
          <p className="mt-3 font-medium text-foreground">
            No courses match these filters
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {allCourses?.length === 0
              ? "Your major doesn't have any courses in the catalog yet."
              : "Try a course code, part of a course name, or a different category."}
          </p>
          <Button
            variant="outline"
            size="lg"
            className="mt-5"
            onClick={() => setParams({}, { replace: true })}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
