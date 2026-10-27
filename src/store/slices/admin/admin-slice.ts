import { createSlice, type PayloadAction, type WithSlice } from "@reduxjs/toolkit"

import { sampleCourses, type AdminCourse } from "@/mock/admin/courses"
import { sampleStudents, type AdminStudent } from "@/mock/admin/students"
import { sampleUniversities, type AdminUniversity } from "@/mock/admin/universities"
import { rootReducer } from "@/store/root-reducer"

/** Recorded as the editor of changes made in the admin console in this prototype session. */
export const CURRENT_ADMIN = "You (admin)"

export type AdminState = {
  universities: AdminUniversity[]
  courses: AdminCourse[]
  students: AdminStudent[]
}

const initialState: AdminState = {
  universities: sampleUniversities,
  courses: sampleCourses,
  students: sampleStudents,
}

const upsert = <T extends { id: string }>(list: T[], item: T) => {
  const index = list.findIndex((entry) => entry.id === item.id)
  if (index === -1) list.unshift(item)
  else list[index] = item
}

/**
 * Admin data for this browser tab. Starts from the sample data; every change lives in memory
 * only and resets on refresh. Swap these reducers for API calls when a backend exists.
 */
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    universitySaved(state, action: PayloadAction<AdminUniversity>) {
      upsert(state.universities, action.payload)
    },
    universityDeleted(state, action: PayloadAction<string>) {
      state.universities = state.universities.filter((u) => u.id !== action.payload)
      state.courses = state.courses.filter((c) => c.universityId !== action.payload)
    },
    courseSaved(state, action: PayloadAction<AdminCourse>) {
      upsert(state.courses, action.payload)
    },
    courseDeleted(state, action: PayloadAction<string>) {
      const removed = state.courses.find((c) => c.id === action.payload)
      if (!removed) return
      const { code, universityId } = removed
      // Drop references to the deleted course from the same university's other courses.
      const strip = (codes: string[]) => codes.filter((entry) => entry !== code)
      state.courses = state.courses.filter((c) => c.id !== action.payload)
      for (const course of state.courses) {
        if (course.universityId !== universityId) continue
        if (course.prerequisites.includes(code)) course.prerequisites = strip(course.prerequisites)
        if (course.corequisites.includes(code)) course.corequisites = strip(course.corequisites)
      }
    },
  },
  selectors: {
    selectAdminData: (state) => state,
  },
})

declare module "@/store/root-reducer" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- registers this lazy slice
  export interface LazyLoadedSlices extends WithSlice<typeof adminSlice> {}
}

// Registered when the admin console's code loads, keeping the sample data out of other routes.
const injectedAdminSlice = adminSlice.injectInto(rootReducer)

export const { universitySaved, universityDeleted, courseSaved, courseDeleted } = injectedAdminSlice.actions
export const { selectAdminData } = injectedAdminSlice.selectors
