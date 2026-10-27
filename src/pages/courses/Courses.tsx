import { useMemo } from "react";
import { SearchX, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { AppPageHeader } from "@/components/shared/page-header";
import { CourseCard } from "@/components/webApp/courses/course-card";
import { FilterChips } from "@/components/webApp/courses/filter-chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  catalogInfo,
  COURSE_CATEGORIES,
  courseCatalog,
  type CourseCategory,
} from "@/mock/academic/course-catalog";
import { filterCatalog } from "@/lib/academic/catalog";
import { courseStatus, type StudentCourseStatus } from "@/lib/academic/record";
import { pluralize } from "@/lib/files/format";

type CategoryFilter = CourseCategory | "all";
type StatusFilter = StudentCourseStatus["kind"] | "all";

const CATEGORY_KEYS = Object.keys(COURSE_CATEGORIES) as CourseCategory[];
const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Any status" },
  { value: "not-taken", label: "Not taken" },
  { value: "planned", label: "Planned" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

const isCategory = (value: string | null): value is CourseCategory =>
  CATEGORY_KEYS.includes(value as CourseCategory);
const isStatus = (value: string | null): value is StatusFilter =>
  STATUS_OPTIONS.some((o) => o.value === value);

export function CoursesPage() {
  // Filters live in the URL so results are shareable and the top-bar search can link here.
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const categoryParam = params.get("category");
  const statusParam = params.get("status");
  const category: CategoryFilter = isCategory(categoryParam)
    ? categoryParam
    : "all";
  const status: StatusFilter = isStatus(statusParam) ? statusParam : "all";

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

  const matchingQuery = useMemo(
    () => filterCatalog(courseCatalog, { query, category: "all" }),
    [query],
  );
  const results = useMemo(
    () =>
      matchingQuery.filter(
        (course) =>
          (category === "all" || course.category === category) &&
          (status === "all" || courseStatus(course.code).kind === status),
      ),
    [matchingQuery, category, status],
  );

  const categoryOptions = [
    { value: "all" as const, label: "All", count: matchingQuery.length },
    ...CATEGORY_KEYS.map((key) => ({
      value: key,
      label: COURSE_CATEGORIES[key].label,
      count: matchingQuery.filter((course) => course.category === key).length,
    })),
  ];
  const hasFilters = Boolean(query) || category !== "all" || status !== "all";

  return (
    <div className="space-y-6">
      <title>Courses · AcadPath</title>
      <AppPageHeader
        title="Courses"
        description={`${courseCatalog.length} courses in the ${catalogInfo.program} catalog at ${catalogInfo.university} (${catalogInfo.catalogYear}).`}
      />

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
            value={category}
            onChange={(value) => update("category", value)}
          />
          <FilterChips
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
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

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {results.map((course) => (
            <CourseCard
              key={course.code}
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
            Try a course code like “MATH 3150”, part of a name like “systems”,
            or a different category.
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
