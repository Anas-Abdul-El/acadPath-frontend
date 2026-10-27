import { createAction, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { NEW_STUDENT_YEAR, type AcademicYear } from "@/data/academic-years";
import type { Account } from "@/simulation/auth/mock-auth";
import type {
  CatalogCheckResult,
  UniversitySelection,
} from "@/simulation/onboarding/university-catalog";
import type { AppThunk } from "@/store/root-reducer";

/**
 * Only non-sensitive progress (mock account, university choice, year) survives a refresh, in
 * sessionStorage. Uploaded files and transcript contents live in memory for this tab only.
 */
const STORAGE_KEY = "acadpath:onboarding";

/** The slice of onboarding state written to sessionStorage. */
type PersistedState = {
  account: Account | null;
  university: UniversitySelection | null;
  /** Result of checking whether the chosen university already has a course catalog. */
  catalog: CatalogCheckResult | null;
  /** Chosen on the transcript step; decides whether a transcript upload is needed. */
  academicYear: AcademicYear | null;
};

type OnboardingState = {
  persisted: PersistedState;
  /** In-memory only: whether each upload step has been completed in this tab. */
  universityDocsSubmitted: boolean;
  transcriptSubmitted: boolean;
};

/** Starting point for a fresh session, and what everything resets to on sign-out. */
const EMPTY: PersistedState = {
  account: null,
  university: null,
  catalog: null,
  academicYear: null,
};

/**
 * Restores saved progress from sessionStorage. Merging over EMPTY fills in any keys missing
 * from older saved shapes; unavailable storage or malformed JSON falls back to a clean state.
 */
function readPersisted(): PersistedState {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw
      ? { ...EMPTY, ...(JSON.parse(raw) as Partial<PersistedState>) }
      : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function writePersisted(persisted: PersistedState) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // Storage can be unavailable (private mode, quota); progress just won't survive a refresh.
  }
}

/**
 * Starts a clean session — signed in as `account`, or signed out when null. Every slice that
 * holds a student's data (uploads, advisor chat) clears itself on this action.
 */
export const sessionReset = createAction<Account | null>("session/reset");

export const onboardingSlice = createSlice({
  name: "onboarding",
  // A function, so sessionStorage is only read when the store is created.
  initialState: (): OnboardingState => ({
    persisted: readPersisted(),
    universityDocsSubmitted: false,
    transcriptSubmitted: false,
  }),
  reducers: {
    /** Same student signing in again: refresh account details, keep their progress. */
    accountRefreshed(state, action: PayloadAction<Account>) {
      state.persisted.account = action.payload;
    },
    universitySaved(
      state,
      action: PayloadAction<{
        university: UniversitySelection;
        catalog: CatalogCheckResult;
        /** True when this replaces a different university the student chose earlier. */
        replaced: boolean;
      }>,
    ) {
      const { university, catalog, replaced } = action.payload;
      state.persisted.university = university;
      state.persisted.catalog = catalog;
      if (replaced) state.universityDocsSubmitted = false;
    },
    academicYearSelected(state, action: PayloadAction<AcademicYear>) {
      state.persisted.academicYear = action.payload;
    },
    submitUniversityDocs(state) {
      state.universityDocsSubmitted = true;
    },
    submitTranscript(state) {
      state.transcriptSubmitted = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionReset, (_state, action) => ({
      persisted: { ...EMPTY, account: action.payload },
      universityDocsSubmitted: false,
      transcriptSubmitted: false,
    }));
  },
  selectors: {
    selectAccount: (state) => state.persisted.account,
    selectUniversity: (state) => state.persisted.university,
    selectCatalog: (state) => state.persisted.catalog,
    selectAcademicYear: (state) => state.persisted.academicYear,
    selectUniversityDocsSubmitted: (state) => state.universityDocsSubmitted,
    selectTranscriptSubmitted: (state) => state.transcriptSubmitted,
    /** False for first-term students: no completed or failed courses yet, GPA starts at 0.00. */
    selectTranscriptRequired: (state) =>
      state.persisted.academicYear !== NEW_STUDENT_YEAR,
  },
});

export const {
  accountRefreshed,
  universitySaved,
  academicYearSelected,
  submitUniversityDocs,
  submitTranscript,
} = onboardingSlice.actions;

export const {
  selectAccount,
  selectUniversity,
  selectCatalog,
  selectAcademicYear,
  selectUniversityDocsSubmitted,
  selectTranscriptSubmitted,
  selectTranscriptRequired,
} = onboardingSlice.selectors;

export const signIn =
  (account: Account): AppThunk =>
  (dispatch, getState) => {
    // A different student in the same tab must not inherit someone else's files.
    if (selectAccount(getState())?.email === account.email)
      dispatch(accountRefreshed(account));
    else dispatch(sessionReset(account));
  };

/** Wipes both the persisted progress and everything held in memory. */
export const signOut = () => sessionReset(null);

export const saveUniversity =
  (university: UniversitySelection, catalog: CatalogCheckResult): AppThunk =>
  (dispatch, getState) => {
    const previous = selectUniversity(getState());
    // Compare names case- and whitespace-insensitively so re-saving the same university
    // with different formatting doesn't count as a switch. A first save never does.
    const replaced =
      previous !== null &&
      previous.name.trim().toLowerCase() !==
        university.name.trim().toLowerCase();
    dispatch(universitySaved({ university, catalog, replaced }));
  };