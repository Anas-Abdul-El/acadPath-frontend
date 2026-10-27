/**
 * Mock university directory behind the simulated catalog check.
 * `catalog` describes the public academic information the prototype pretends to find;
 * `null` means no public catalog is available and the student is asked to upload documents.
 */
export type UniversityRecord = {
  id: string
  name: string
  /** Common abbreviation, also accepted as a match, e.g. "UBC". */
  shortName?: string
  country: string
  city: string
  catalog: {
    title: string
    source: string
    courses: number
    programs: number
  } | null
}

export const universities: UniversityRecord[] = [
  {
    id: "umich",
    name: "University of Michigan",
    shortName: "U-M",
    country: "United States",
    city: "Ann Arbor",
    catalog: { title: "LSA Course Guide 2025–2026", source: "lsa.umich.edu", courses: 4180, programs: 112 },
  },
  {
    id: "gatech",
    name: "Georgia Institute of Technology",
    shortName: "Georgia Tech",
    country: "United States",
    city: "Atlanta",
    catalog: { title: "Undergraduate Catalog 2025–2026", source: "catalog.gatech.edu", courses: 3260, programs: 58 },
  },
  {
    id: "asu",
    name: "Arizona State University",
    shortName: "ASU",
    country: "United States",
    city: "Tempe",
    catalog: { title: "Academic Catalog 2025–2026", source: "catalog.asu.edu", courses: 6420, programs: 350 },
  },
  {
    id: "uoft",
    name: "University of Toronto",
    shortName: "U of T",
    country: "Canada",
    city: "Toronto",
    catalog: { title: "Arts & Science Academic Calendar 2025–26", source: "artsci.calendar.utoronto.ca", courses: 3890, programs: 96 },
  },
  {
    id: "ubc",
    name: "University of British Columbia",
    shortName: "UBC",
    country: "Canada",
    city: "Vancouver",
    catalog: { title: "Academic Calendar 2025/26", source: "vancouver.calendar.ubc.ca", courses: 5110, programs: 140 },
  },
  {
    id: "manchester",
    name: "University of Manchester",
    country: "United Kingdom",
    city: "Manchester",
    catalog: null,
  },
  {
    id: "edinburgh",
    name: "University of Edinburgh",
    country: "United Kingdom",
    city: "Edinburgh",
    catalog: { title: "Degree Programme Tables 2025/26", source: "drps.ed.ac.uk", courses: 2970, programs: 88 },
  },
  {
    id: "tum",
    name: "Technical University of Munich",
    shortName: "TUM",
    country: "Germany",
    city: "Munich",
    catalog: null,
  },
  {
    id: "unimelb",
    name: "University of Melbourne",
    country: "Australia",
    city: "Melbourne",
    catalog: { title: "Handbook 2026", source: "handbook.unimelb.edu.au", courses: 3640, programs: 104 },
  },
  {
    id: "nus",
    name: "National University of Singapore",
    shortName: "NUS",
    country: "Singapore",
    city: "Singapore",
    catalog: { title: "NUSMods Module Directory AY2025/26", source: "nusmods.com", courses: 6100, programs: 95 },
  },
  {
    id: "um-my",
    name: "Universiti Malaya",
    shortName: "UM",
    country: "Malaysia",
    city: "Kuala Lumpur",
    catalog: null,
  },
  {
    id: "metu",
    name: "Middle East Technical University",
    shortName: "METU",
    country: "Türkiye",
    city: "Ankara",
    catalog: { title: "Course Catalog 2025–2026", source: "catalog.metu.edu.tr", courses: 2410, programs: 41 },
  },
  {
    id: "aub",
    name: "American University of Beirut",
    shortName: "AUB",
    country: "Lebanon",
    city: "Beirut",
    catalog: { title: "Undergraduate Catalogue 2025–26", source: "aub.edu.lb/catalog", courses: 1980, programs: 63 },
  },
  {
    id: "ju",
    name: "University of Jordan",
    shortName: "UJ",
    country: "Jordan",
    city: "Amman",
    catalog: null,
  },
  {
    id: "kfupm",
    name: "King Fahd University of Petroleum and Minerals",
    shortName: "KFUPM",
    country: "Saudi Arabia",
    city: "Dhahran",
    catalog: { title: "Undergraduate Bulletin 2025–2026", source: "kfupm.edu.sa", courses: 1460, programs: 34 },
  },
  {
    id: "ksu",
    name: "King Saud University",
    shortName: "KSU",
    country: "Saudi Arabia",
    city: "Riyadh",
    catalog: null,
  },
  {
    id: "aus",
    name: "American University of Sharjah",
    shortName: "AUS",
    country: "United Arab Emirates",
    city: "Sharjah",
    catalog: { title: "Undergraduate Catalog 2025–2026", source: "aus.edu/catalog", courses: 1320, programs: 29 },
  },
  {
    id: "qu",
    name: "Qatar University",
    shortName: "QU",
    country: "Qatar",
    city: "Doha",
    catalog: null,
  },
  {
    id: "cu",
    name: "Cairo University",
    country: "Egypt",
    city: "Giza",
    catalog: null,
  },
  {
    id: "auc",
    name: "The American University in Cairo",
    shortName: "AUC",
    country: "Egypt",
    city: "New Cairo",
    catalog: { title: "Undergraduate Catalog 2025–2026", source: "catalog.aucegypt.edu", courses: 1750, programs: 40 },
  },
  {
    id: "uofk",
    name: "University of Khartoum",
    shortName: "UofK",
    country: "Sudan",
    city: "Khartoum",
    catalog: null,
  },
  {
    id: "uct",
    name: "University of Cape Town",
    shortName: "UCT",
    country: "South Africa",
    city: "Cape Town",
    catalog: null,
  },
  {
    id: "unilag",
    name: "University of Lagos",
    shortName: "UNILAG",
    country: "Nigeria",
    city: "Lagos",
    catalog: null,
  },
  {
    id: "iitb",
    name: "Indian Institute of Technology Bombay",
    shortName: "IIT Bombay",
    country: "India",
    city: "Mumbai",
    catalog: null,
  },
]
