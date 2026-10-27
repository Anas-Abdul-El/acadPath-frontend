/**
 * Sample registered students for the admin console. Generated deterministically from the
 * lists below so the data is stable between reloads. Holds only profile-level information —
 * no transcript contents. Replace with the admin API response later.
 */

export type AdminStudent = {
  id: string
  name: string
  email: string
  universityId: string
  program: string
  registeredAt: string
  /** Present once a transcript has been processed. */
  academic?: { gpa: number; creditsCompleted: number; creditsRequired: number; expectedGraduation: string }
  documents: { transcripts: number }
  lastActiveAt: string
}

/** How far a sample student got: records processed, transcript uploaded only, or nothing uploaded. */
type Stage = "processed" | "uploaded" | "none"

const FIRST = ["Omar", "Maya", "Lina", "Yousef", "Sara", "Daniel", "Aisha", "Karim", "Noor", "Ethan", "Hana", "Ali", "Priya", "Zaid", "Leila", "Mateo", "Rania", "Samir", "Chloe", "Tariq", "Mariam", "Jonas", "Dana", "Ibrahim", "Sofia", "Hamza", "Amira", "Lucas", "Reem", "Adam"]
const LAST = ["Haddad", "Chen", "Nasser", "Al-Masri", "Khalil", "Okafor", "Rahman", "Saleh", "Haddad", "Müller", "Yamamoto", "Hussein", "Patel", "Barakat", "Navarro", "García", "Aziz", "Darwish", "Martin", "Qasim", "Abdallah", "Weber", "Odeh", "Mansour", "Rossi", "Jaber", "Fayad", "Silva", "Zahran", "Brooks"]
const UNIVERSITIES = ["northfield", "northfield", "northfield", "ju", "ju", "aub", "kfupm", "cu", "uoft", "umich", "aus", "uofk", "qu", "metu", "gatech"]
const PROGRAMS = ["B.Sc. Computer Science", "B.Sc. Computer Science", "B.Sc. Software Engineering", "B.Sc. Data Science", "B.Eng. Computer Engineering", "B.Sc. Information Systems"]
const STAGES: Stage[] = ["processed", "processed", "processed", "uploaded", "none", "processed", "none", "processed", "uploaded", "none"]
const GRADUATIONS = ["May 2027", "Dec 2027", "May 2028", "Dec 2028", "May 2029"]

/** Small deterministic PRNG (mulberry32) so the sample data never changes between loads. */
function random(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pad = (value: number) => String(value).padStart(2, "0")

function generate(count: number): AdminStudent[] {
  const next = random(2026)
  const pick = <T,>(list: T[]) => list[Math.floor(next() * list.length)]

  return Array.from({ length: count }, (_, index) => {
    const first = FIRST[index % FIRST.length]
    const last = LAST[(index * 7) % LAST.length]
    // More registrations in recent months, like a product that's growing.
    const month = Math.min(10, 3 + Math.floor(Math.sqrt(next()) * 8))
    const day = 1 + Math.floor(next() * (month === 10 ? 15 : 28))
    // Many October sign-ups haven't uploaded anything yet.
    const stage: Stage = month === 10 && next() > 0.4 ? "none" : pick(STAGES)
    const universityId = pick(UNIVERSITIES)
    const domain = universityId === "northfield" ? "northfield.edu" : `${universityId}.edu`
    const creditsCompleted = 24 + Math.floor(next() * 90)

    return {
      id: `stu-${1001 + index}`,
      name: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "") + `@${domain}`,
      universityId,
      program: pick(PROGRAMS),
      registeredAt: `2026-${pad(month)}-${pad(day)}`,
      academic:
        stage === "processed"
          ? {
              gpa: Math.round((2.6 + next() * 1.35) * 100) / 100,
              creditsCompleted,
              creditsRequired: 128,
              expectedGraduation: pick(GRADUATIONS),
            }
          : undefined,
      documents: { transcripts: stage === "none" ? 0 : 1 + Math.floor(next() * 2) },
      lastActiveAt: `2026-10-${pad(1 + Math.floor(next() * 15))}`,
    }
  })
}

export const sampleStudents: AdminStudent[] = generate(64)
