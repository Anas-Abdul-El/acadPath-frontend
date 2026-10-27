/**
 * Sample learning resources. Only YouTube, Udemy, and Coursera are supported.
 *
 * `verified: true` links point to real pages we're confident exist. Everything else is a sample
 * listing: its link opens a search for the title on that platform instead of a made-up URL.
 * Durations are rough estimates. Replace with a resource-search API later.
 */

export type Platform = "youtube" | "udemy" | "coursera"
export type Difficulty = "Beginner" | "Intermediate" | "Advanced"

/** Question bank used for practice quizzes (see `quiz-bank.ts`). */
export type QuizTopic =
  | "discrete-math"
  | "algorithms"
  | "probability"
  | "linear-algebra"
  | "databases"
  | "operating-systems"
  | "networks"
  | "machine-learning"

export type LearningResource = {
  id: string
  title: string
  platform: Platform
  /** Instructor, channel, or institution. */
  provider: string
  format: string
  description: string
  duration: string
  difficulty: Difficulty
  courseCodes: string[]
  topics: string[]
  quizTopic: QuizTopic
  url: string
  verified: boolean
}

export const PLATFORMS: Record<Platform, { label: string }> = {
  youtube: { label: "YouTube" },
  udemy: { label: "Udemy" },
  coursera: { label: "Coursera" },
}

const search = (platform: Platform, query: string) => {
  const q = encodeURIComponent(query)
  return platform === "youtube"
    ? `https://www.youtube.com/results?search_query=${q}`
    : platform === "udemy"
      ? `https://www.udemy.com/courses/search/?q=${q}`
      : `https://www.coursera.org/search?query=${q}`
}

export const resources: LearningResource[] = [
  // Discrete mathematics — CS 2050
  {
    id: "coursera-discrete-math",
    title: "Introduction to Discrete Mathematics for Computer Science",
    platform: "coursera",
    provider: "UC San Diego & HSE University",
    format: "Specialization",
    description:
      "Proofs, induction, combinatorics, probability, and graph theory taught through interactive puzzles and programming exercises.",
    duration: "≈ 40 hours",
    difficulty: "Beginner",
    courseCodes: ["CS 2050"],
    topics: ["discrete math", "proofs", "induction", "combinatorics", "graphs", "logic"],
    quizTopic: "discrete-math",
    url: "https://www.coursera.org/specializations/discrete-mathematics",
    verified: true,
  },
  {
    id: "youtube-trefor-discrete",
    title: "Discrete Math lecture series",
    platform: "youtube",
    provider: "Dr. Trefor Bazett",
    format: "Video series",
    description:
      "Short, focused videos on logic, sets, functions, relations, and proof techniques — good for revisiting one idea at a time.",
    duration: "≈ 12 hours",
    difficulty: "Beginner",
    courseCodes: ["CS 2050"],
    topics: ["discrete math", "logic", "sets", "proofs", "relations"],
    quizTopic: "discrete-math",
    url: "https://www.youtube.com/@DrTrefor",
    verified: true,
  },
  {
    id: "udemy-discrete-math",
    title: "Discrete Mathematics: Logic, Proofs, and Counting",
    platform: "udemy",
    provider: "Sample listing",
    format: "Course",
    description: "Worked examples on truth tables, quantifiers, proof by contradiction, and counting principles, with practice sets.",
    duration: "≈ 9 hours",
    difficulty: "Beginner",
    courseCodes: ["CS 2050"],
    topics: ["discrete math", "logic", "proofs", "counting"],
    quizTopic: "discrete-math",
    url: search("udemy", "discrete mathematics"),
    verified: false,
  },

  // Algorithms — CS 3110
  {
    id: "coursera-algorithms-part1",
    title: "Algorithms, Part I",
    platform: "coursera",
    provider: "Princeton University",
    format: "Course",
    description: "Union-find, sorting, priority queues, and search trees, with programming assignments graded on correctness and performance.",
    duration: "≈ 50 hours",
    difficulty: "Intermediate",
    courseCodes: ["CS 3110", "CS 2110"],
    topics: ["algorithms", "sorting", "data structures", "search trees", "complexity"],
    quizTopic: "algorithms",
    url: "https://www.coursera.org/learn/algorithms-part1",
    verified: true,
  },
  {
    id: "coursera-algorithms-specialization",
    title: "Algorithms Specialization",
    platform: "coursera",
    provider: "Stanford University",
    format: "Specialization",
    description: "Divide and conquer, graph search, greedy algorithms, dynamic programming, and NP-completeness — closely matches CS 3110.",
    duration: "≈ 60 hours",
    difficulty: "Advanced",
    courseCodes: ["CS 3110"],
    topics: ["algorithms", "dynamic programming", "graphs", "greedy", "np-completeness", "divide and conquer"],
    quizTopic: "algorithms",
    url: "https://www.coursera.org/specializations/algorithms",
    verified: true,
  },
  {
    id: "youtube-abdul-bari",
    title: "Algorithms lectures",
    platform: "youtube",
    provider: "Abdul Bari",
    format: "Video series",
    description: "Whiteboard walkthroughs of asymptotic analysis, divide and conquer, greedy methods, and dynamic programming.",
    duration: "≈ 20 hours",
    difficulty: "Beginner",
    courseCodes: ["CS 3110"],
    topics: ["algorithms", "dynamic programming", "greedy", "complexity", "divide and conquer"],
    quizTopic: "algorithms",
    url: "https://www.youtube.com/@abdul_bari",
    verified: true,
  },
  {
    id: "youtube-mit-6006",
    title: "Introduction to Algorithms (MIT 6.006)",
    platform: "youtube",
    provider: "MIT OpenCourseWare",
    format: "Lecture recordings",
    description: "Full MIT lectures on sorting, hashing, graph algorithms, shortest paths, and dynamic programming.",
    duration: "≈ 30 hours",
    difficulty: "Advanced",
    courseCodes: ["CS 3110"],
    topics: ["algorithms", "graphs", "shortest paths", "hashing", "dynamic programming"],
    quizTopic: "algorithms",
    url: "https://www.youtube.com/@mitocw",
    verified: true,
  },
  {
    id: "udemy-coding-interview",
    title: "Master the Coding Interview: Data Structures + Algorithms",
    platform: "udemy",
    provider: "Sample listing",
    format: "Course",
    description: "Practical data structures and algorithm patterns with interview-style problems and complexity analysis.",
    duration: "≈ 20 hours",
    difficulty: "Intermediate",
    courseCodes: ["CS 3110", "CS 2110"],
    topics: ["algorithms", "data structures", "complexity", "interviews"],
    quizTopic: "algorithms",
    url: search("udemy", "data structures and algorithms"),
    verified: false,
  },

  // Probability & statistics — MATH 3150
  {
    id: "coursera-probability-intro",
    title: "Introduction to Probability and Data with R",
    platform: "coursera",
    provider: "Duke University",
    format: "Course",
    description: "Sampling, exploratory data analysis, and the basic rules of probability, with hands-on labs in R.",
    duration: "≈ 15 hours",
    difficulty: "Beginner",
    courseCodes: ["MATH 3150", "STAT 3300"],
    topics: ["probability", "statistics", "data analysis", "r"],
    quizTopic: "probability",
    url: "https://www.coursera.org/learn/probability-intro",
    verified: true,
  },
  {
    id: "youtube-statquest",
    title: "StatQuest: statistics and probability, clearly explained",
    platform: "youtube",
    provider: "StatQuest with Josh Starmer",
    format: "Video series",
    description: "Visual explanations of distributions, p-values, hypothesis testing, and regression — great for exam review.",
    duration: "≈ 8 hours",
    difficulty: "Beginner",
    courseCodes: ["MATH 3150", "STAT 3300"],
    topics: ["statistics", "probability", "hypothesis testing", "distributions", "regression"],
    quizTopic: "probability",
    url: "https://www.youtube.com/@statquest",
    verified: true,
  },
  {
    id: "youtube-stat110",
    title: "Statistics 110: Probability",
    platform: "youtube",
    provider: "Harvard University (Joe Blitzstein)",
    format: "Lecture recordings",
    description: "A rigorous probability course: conditioning, random variables, expectation, and common distributions.",
    duration: "≈ 35 hours",
    difficulty: "Advanced",
    courseCodes: ["MATH 3150"],
    topics: ["probability", "random variables", "distributions", "expectation"],
    quizTopic: "probability",
    url: search("youtube", "Statistics 110 Probability Blitzstein"),
    verified: false,
  },
  {
    id: "udemy-statistics-ds",
    title: "Statistics for Data Science and Business Analysis",
    platform: "udemy",
    provider: "Sample listing",
    format: "Course",
    description: "Descriptive statistics, distributions, confidence intervals, and hypothesis tests with spreadsheet examples.",
    duration: "≈ 5 hours",
    difficulty: "Beginner",
    courseCodes: ["MATH 3150"],
    topics: ["statistics", "confidence intervals", "hypothesis testing", "distributions"],
    quizTopic: "probability",
    url: search("udemy", "statistics for data science"),
    verified: false,
  },

  // Linear algebra — MATH 2310
  {
    id: "youtube-3b1b-linear-algebra",
    title: "Essence of linear algebra",
    platform: "youtube",
    provider: "3Blue1Brown",
    format: "Video series",
    description: "Geometric intuition for vectors, linear transformations, determinants, and eigenvectors in short animated chapters.",
    duration: "≈ 3 hours",
    difficulty: "Beginner",
    courseCodes: ["MATH 2310"],
    topics: ["linear algebra", "vectors", "matrices", "eigenvalues"],
    quizTopic: "linear-algebra",
    url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
    verified: true,
  },
  {
    id: "coursera-linear-algebra-ml",
    title: "Mathematics for Machine Learning: Linear Algebra",
    platform: "coursera",
    provider: "Imperial College London",
    format: "Course",
    description: "Vectors, matrices, basis changes, and eigenproblems, applied to data and machine-learning examples.",
    duration: "≈ 20 hours",
    difficulty: "Intermediate",
    courseCodes: ["MATH 2310", "CS 4620"],
    topics: ["linear algebra", "matrices", "eigenvalues", "machine learning"],
    quizTopic: "linear-algebra",
    url: "https://www.coursera.org/learn/linear-algebra-machine-learning",
    verified: true,
  },

  // Databases — CS 3520
  {
    id: "youtube-cmu-databases",
    title: "Intro to Database Systems (CMU 15-445)",
    platform: "youtube",
    provider: "CMU Database Group",
    format: "Lecture recordings",
    description: "Storage, indexing, query processing, concurrency control, and recovery from Carnegie Mellon's database course.",
    duration: "≈ 30 hours",
    difficulty: "Advanced",
    courseCodes: ["CS 3520"],
    topics: ["databases", "indexing", "transactions", "query processing", "sql"],
    quizTopic: "databases",
    url: "https://www.youtube.com/@CMUDatabaseGroup",
    verified: true,
  },
  {
    id: "udemy-sql-bootcamp",
    title: "The Complete SQL Bootcamp",
    platform: "udemy",
    provider: "Sample listing",
    format: "Course",
    description: "Hands-on SQL from SELECT to joins, aggregation, subqueries, and table design, using PostgreSQL.",
    duration: "≈ 9 hours",
    difficulty: "Beginner",
    courseCodes: ["CS 3520"],
    topics: ["sql", "databases", "joins", "postgresql"],
    quizTopic: "databases",
    url: search("udemy", "complete sql bootcamp"),
    verified: false,
  },

  // Operating systems — CS 3410
  {
    id: "youtube-neso-os",
    title: "Operating Systems",
    platform: "youtube",
    provider: "Neso Academy",
    format: "Video series",
    description: "Processes, CPU scheduling, synchronization, deadlocks, and memory management explained step by step.",
    duration: "≈ 15 hours",
    difficulty: "Beginner",
    courseCodes: ["CS 3410"],
    topics: ["operating systems", "scheduling", "synchronization", "memory", "deadlocks"],
    quizTopic: "operating-systems",
    url: "https://www.youtube.com/@nesoacademy",
    verified: true,
  },
  {
    id: "udemy-os-concepts",
    title: "Operating Systems: From Processes to Virtual Memory",
    platform: "udemy",
    provider: "Sample listing",
    format: "Course",
    description: "Practical OS concepts with C examples: threads, locks, paging, and file systems.",
    duration: "≈ 11 hours",
    difficulty: "Intermediate",
    courseCodes: ["CS 3410"],
    topics: ["operating systems", "threads", "virtual memory", "file systems"],
    quizTopic: "operating-systems",
    url: search("udemy", "operating systems"),
    verified: false,
  },

  // Networks — CS 3200
  {
    id: "coursera-google-networking",
    title: "The Bits and Bytes of Computer Networking",
    platform: "coursera",
    provider: "Google",
    format: "Course",
    description: "The TCP/IP model, addressing, routing, DNS, and troubleshooting, with practical examples.",
    duration: "≈ 30 hours",
    difficulty: "Beginner",
    courseCodes: ["CS 3200"],
    topics: ["networks", "tcp/ip", "routing", "dns"],
    quizTopic: "networks",
    url: "https://www.coursera.org/learn/computer-networking",
    verified: true,
  },

  // Machine learning — CS 4620
  {
    id: "coursera-ml-specialization",
    title: "Machine Learning Specialization",
    platform: "coursera",
    provider: "Stanford University & DeepLearning.AI",
    format: "Specialization",
    description: "Regression, classification, neural networks, decision trees, and unsupervised learning in Python.",
    duration: "≈ 90 hours",
    difficulty: "Beginner",
    courseCodes: ["CS 4620"],
    topics: ["machine learning", "regression", "classification", "neural networks"],
    quizTopic: "machine-learning",
    url: "https://www.coursera.org/specializations/machine-learning-introduction",
    verified: true,
  },
]
