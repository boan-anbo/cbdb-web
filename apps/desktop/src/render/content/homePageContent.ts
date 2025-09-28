/**
 * Homepage Content
 * Extracted from README.md for maintainability
 */

export const homePageContent = {
  hero: {
    title: "CBDB Desktop",
    subtitle: "China Biographical Database",
    description: "Free and open-source interface and analytics platform for the China Biographical Database. Provides Access-style workflows, powerful search, and advanced analytics."
  },

  about: {
    title: "About CBDB Desktop & Web",
    intro: "China Biographical Database (CBDB) is a project started by Robert M. Hartwell and Michael A. Fuller and is owned and maintained by teams at Harvard University, Academia Sinica, and Peking University.",
    contribution: "Contributing to the ecosystem, CBDB Desktop & Web provides a free and open‑source interface and analytics platform across the desktop and the browser for CBDB. One download runs locally with no extra dependencies; a web demo is available for quick evaluation.",
    infrastructure: "Beyond providing applications, this project also provides a solid infrastructure using web technology as a starting point for future work. It emphasizes interoperability with research and analytics tools (e.g., Zotero), visualization and statistics software, and AI integration.",
    performance: "Performance is part of this infrastructure focus (e.g., web workers on the frontend, Node worker threads on the backend, with a path to high‑performance computation via WebAssembly)."
  },

  features: {
    title: "Features",
    categories: {
      access: {
        title: "Access",
        items: [
          {
            name: "Person Browser",
            description: "Birth/Death, Offices, Kinship - Access‑style workflows with a clean, modern layout; parity goal with classic forms"
          },
          {
            name: "Search & Browse",
            description: "Quick name search (中文/English), jump straight to a person"
          }
        ]
      },
      data: {
        title: "Data",
        items: [
          {
            name: "One download",
            description: "Runs locally with a bundled CBDB archive"
          },
          {
            name: "Read-only access",
            description: "Consistent entity views and nested sets"
          },
          {
            name: "Database management",
            description: "Remembers recent databases"
          }
        ]
      },
      analytics: {
        title: "Analytics",
        items: [
          {
            name: "Graph (networks)",
            description: "MVP demonstrations with reproducible outputs; depth and type toggles in networks"
          },
          {
            name: "Timeline (tenures)",
            description: "Chronological visualization of office tenures"
          },
          {
            name: "GIS (places)",
            description: "Geographic mapping and analysis"
          }
        ]
      },
      api: {
        title: "API",
        items: [
          {
            name: "Read-only endpoints",
            description: "Search, person details, relations, and network exploration"
          },
          {
            name: "Auto-documentation",
            description: "Interactive API docs at /docs"
          }
        ]
      }
    }
  },

  keyHighlights: [
    {
      icon: "Zap",
      title: "517,000+ Records",
      description: "Biographical information on approximately 517,000 individuals, primarily from the 7th through early 20th centuries"
    },
    {
      icon: "Lock",
      title: "Offline-First",
      description: "The application runs completely offline after extracting the bundled CBDB archive on first launch"
    },
    {
      icon: "Code",
      title: "Open API",
      description: "Read‑only endpoints for search, person details, relations, and network exploration; auto‑documented"
    },
    {
      icon: "Users",
      title: "Access-Style Interface",
      description: "Familiar workflows for existing CBDB users with modern improvements"
    },
    {
      icon: "Globe",
      title: "Cross-Platform",
      description: "Available for Windows, macOS, Linux, and Web"
    },
    {
      icon: "Clock",
      title: "Modern Performance",
      description: "Web workers and optimized queries for fast response"
    }
  ],

  quickStart: {
    title: "Quick Start",
    desktop: {
      title: "Desktop",
      steps: [
        "Install → launch",
        "On first launch the app unzips the bundled CBDB archive",
        "Start searching and browsing"
      ]
    },
    web: {
      title: "Web demo",
      description: "Open the URL and start searching (no local setup)",
      url: "https://dh-tools.com/cbdb"
    }
  },

  currentStatus: {
    title: "Current Status (MVP)",
    tracks: [
      "Reproduce and modernize the classic Access experience (feature parity over time)",
      "Stabilize MVP analytics (graph, timeline, GIS) and continue architectural improvements while reproducing the Access interface"
    ]
  },

  infrastructure: {
    title: "Infrastructure Design",
    architecture: {
      title: "Architecture (Contract · Backend · Frontend · Electron)",
      components: [
        {
          name: "Contract (Shared Core)",
          description: "The center of gravity containing Data Modeling Contracts and API Contracts. Both frontend and backend consume the same contracts to stay aligned."
        },
        {
          name: "Backend (NestJS API)",
          description: "Read‑only API; repositories perform joins/compositions; analytics consumes Data Views."
        },
        {
          name: "Frontend (React UI)",
          description: "Person Browser, Network Explorer, Timeline; consumes only documented shapes."
        },
        {
          name: "Electron (Desktop host)",
          description: "Packages the app, first‑run unzips the bundled database, keeps everything offline/local."
        }
      ]
    },
    dataFlow: "SQLite → Repositories → Models → Extended Models → Data Views → API → Frontend"
  },

  dataModeling: {
    title: "Data Modeling",
    description: "We organize CBDB data into four layers so results are consistent and analysis‑ready:",
    layers: [
      {
        name: "Tables (source)",
        description: "Exactly as published by CBDB (tables or views), used read‑only."
      },
      {
        name: "Models (entity view with necessary lookups)",
        description: "A model represents one entity record with necessary table joins to resolve code dictionaries into human‑readable fields."
      },
      {
        name: "Extended Models (ready‑to‑use nested sets)",
        description: "Models plus required relations across entities. Empty relations are [] (not omitted)."
      },
      {
        name: "Data Views (analysis‑ready compositions)",
        description: "Named compositions tailored for analytics/visualization, not tied to a single screen."
      }
    ]
  },

  examples: {
    wangAnshi: {
      title: "Example: Wang Anshi (王安石, personId = 1762)",
      description: "This example shows how data flows from SQLite tables to Models → Extended Models → Data Views → UI"
    }
  },

  roadmap: {
    title: "Roadmap",
    items: [
      "Parity with Access forms (addresses/texts) and list views",
      "Enhanced exports (CSV/JSON/GraphML/GEXF/PNG)",
      "Visualizations: family‑tree, maps, timelines, multi‑person networks",
      "Productivity: saved searches, bookmarks, notes, shareable views",
      "Integrations: Zotero plugin and future extensions",
      "AI assistance (exploratory): natural‑language queries, auto‑summaries, network insights, name disambiguation"
    ],
    note: "No dates are announced; items may shift as we learn from users."
  },

  privacy: {
    title: "Privacy & Data Use",
    points: [
      "Desktop is offline and local by default; CBDB data is accessed read‑only",
      "The application does not modify CBDB data",
      "For any commercial use of CBDB data, read CBDB licensing",
      "In mainland China, CBDB granted an exclusive commercial license to ChineseAll.com beginning in 2018"
    ]
  },

  faq: {
    title: "FAQ",
    items: [
      {
        question: "Do I need Microsoft Access?",
        answer: "No. CBDB Desktop runs natively on Windows, macOS, and Linux, with a bundled CBDB archive."
      },
      {
        question: "Do I need internet access?",
        answer: "Desktop works offline after the first run. The web version runs in your browser."
      },
      {
        question: "Where does the data come from?",
        answer: "From the CBDB archive bundled with the desktop app. Future releases will follow CBDB updates."
      },
      {
        question: "Can I use CBDB data for commercial purposes?",
        answer: "Review CBDB licensing first. In mainland China, CBDB granted an exclusive commercial license to ChineseAll.com beginning in 2018."
      },
      {
        question: "Does the app change CBDB data?",
        answer: "No. The app is read‑only with respect to CBDB data."
      },
      {
        question: "Will there be a Chinese interface?",
        answer: "Yes, bilingual UI is planned."
      }
    ]
  },

  migration: {
    title: "Migration from Access",
    goal: "Goal: Parity, with Enhancements",
    points: [
      "Familiar tabs: Birth/Death, Offices, Kinship mirror Access forms with a cleaner, modern layout",
      "Immediate start: No separate Access runtime; bundled database is detected on first run",
      "New capability: Person‑centric network view with relation toggles and depth control",
      "Continuity: Addresses, Texts, and other Access features are planned"
    ]
  },

  knownLimitations: {
    title: "Known Limitations (MVP)",
    items: [
      "Addresses and Texts tabs are not yet available",
      "People list view and advanced search facets are in progress",
      "Exports are limited; rich formats (CSV/JSON/GraphML/GEXF/PNG) are planned",
      "Family‑tree view, maps, timelines, and multi‑person networks are planned",
      "Saved searches, bookmarks, notes, and shareable views are planned"
    ]
  },

  resources: {
    cbdbHomepage: "https://projects.iq.harvard.edu/cbdb",
    cbdbLicensing: "https://projects.iq.harvard.edu/cbdb/exclusive-commercial-license",
    githubRepo: "https://github.com/your-repo/cbdb-desktop",
    webDemo: "https://dh-tools.com/cbdb"
  },

  codeExamples: {
    api: {
      typescript: `// Search for persons by name
const response = await fetch('/api/people/search?name=王安石&limit=10');
const data = await response.json();

// Get person details with relations
const person = await fetch('/api/people/detail?id=1762');
const details = await person.json();

// Explore relationship network
const network = await fetch('/api/people/1762/explore/network?depth=2');
const graph = await network.json();`,

      python: `import requests

# Initialize API client
BASE_URL = "http://localhost:18019/api"

# Search for historical figures
def search_persons(name, limit=10):
    response = requests.get(f"{BASE_URL}/people/search",
                           params={"name": name, "limit": limit})
    return response.json()

# Get detailed person information
def get_person_detail(person_id):
    response = requests.get(f"{BASE_URL}/people/detail",
                           params={"id": person_id})
    return response.json()

# Example usage
results = search_persons("王安石")
wang_anshi = get_person_detail(1762)
print(f"Found: {wang_anshi['nameChn']} ({wang_anshi['indexYear']})")`
    },

    sql: {
      personIdentity: `-- Person row from BIOG_MAIN (table as‑is)
SELECT c_personid, c_name, c_name_chn, c_index_year
FROM BIOG_MAIN
WHERE c_personid = 1762;`,

      associations: `-- Associations with human‑readable type via ASSOC_CODES
SELECT a.c_personid,
       a.c_assoc_personid,
       a.c_assoc_code,
       ac.c_assoc_desc       AS assoc_type,
       ac.c_assoc_desc_chn   AS assoc_type_chn,
       a.c_assoc_first_year  AS first_year,
       a.c_assoc_last_year   AS last_year
FROM ASSOC_DATA a
LEFT JOIN ASSOC_CODES ac ON a.c_assoc_code = ac.c_assoc_code
WHERE a.c_personid = 1762;`,

      kinship: `-- Kinship edges with kinship type labels and related person
SELECT k.c_personid,
       k.c_kin_id        AS kin_personid,
       k.c_kin_code,
       kc.c_kin_desc     AS kin_type,
       kc.c_kin_desc_chn AS kin_type_chn
FROM KIN_DATA k
LEFT JOIN KINSHIP_CODES kc ON k.c_kin_code = kc.c_kin_code
WHERE k.c_personid = 1762;`
    }
  }
};