// src/data/mockData.js

export const ALERTS = [
  { id: 1, name: "Dengue Fever",        location: "Mohali, Panchkula, Ambala", cases: 312, sev: "high"   },
  { id: 2, name: "Influenza A (H3N2)",  location: "Chandigarh, Ludhiana",      cases: 189, sev: "medium" },
  { id: 3, name: "Typhoid",             location: "Jalandhar, Amritsar",       cases: 97,  sev: "medium" },
  { id: 4, name: "Chikungunya",         location: "Gurugram, Faridabad",       cases: 54,  sev: "low"    },
  { id: 5, name: "Cholera (Watch)",     location: "Rural Punjab zones",        cases: 11,  sev: "high"   },
];

export const DISEASES = [
  { id: 1, name: "Dengue",      cases: 312, dot: "bg-red-500"     },
  { id: 2, name: "Influenza",   cases: 189, dot: "bg-yellow-400"  },
  { id: 3, name: "Typhoid",     cases: 97,  dot: "bg-orange-400"  },
  { id: 4, name: "Chikungunya", cases: 54,  dot: "bg-purple-400"  },
  { id: 5, name: "Cholera",     cases: 11,  dot: "bg-red-600"     },
  { id: 6, name: "Malaria",     cases: 38,  dot: "bg-cyan-400"    },
  { id: 7, name: "COVID-19",    cases: 22,  dot: "bg-emerald-400" },
];

export const DATA_SOURCES = [
  { id: 1, name: "IDSP Weekly Report", icon: "🏥", status: "synced"  },
  { id: 2, name: "WHO India Bulletin", icon: "🌐", status: "synced"  },
  { id: 3, name: "NCDC Surveillance",  icon: "🔬", status: "synced"  },
  { id: 4, name: "State Health Dept.", icon: "📋", status: "pending" },
];

export const TRENDS = [
  { id: 1, name: "Dengue",    pct: "+24%", up: true,  bars: [3,5,7,6,9,11,14] },
  { id: 2, name: "Influenza", pct: "+12%", up: true,  bars: [6,7,8,9,10,11,12] },
  { id: 3, name: "Typhoid",   pct: "-8%",  up: false, bars: [14,12,11,9,8,7,6]  },
  { id: 4, name: "Malaria",   pct: "-3%",  up: false, bars: [8,8,7,7,6,6,5]    },
];

export const NOTIFICATIONS = [
  { id: 1, icon: "🚨", title: "New Dengue Surge",      body: "Cases up 24% in Mohali",         time: "2m ago",  urgent: true  },
  { id: 2, icon: "💊", title: "Vaccination Drive",     body: "Flu shots available at CHC",     time: "1h ago",  urgent: false },
  { id: 3, icon: "📊", title: "Week 12 Report Ready",  body: "IDSP bulletin summarized by AI", time: "3h ago",  urgent: false },
];

export const QUICK_QUESTIONS = [
  "What's spreading near me?",
  "Dengue precautions?",
  "Nearest health center?",
  "Weekly disease summary",
  "Flu symptoms & treatment",
  "Water-borne diseases today",
];

export const HERO_STATS = [
  { num: "2,847", label: "Reports Analyzed" },
  { num: "38",    label: "Districts Covered" },
  { num: "6",     label: "Active Alerts"     },
];

export const MAP_DOTS = [
  { id: 1, top: "28%", left: "42%", size: 18, color: "rgba(255,61,90,0.7)",  delay: "0s"    },
  { id: 2, top: "55%", left: "63%", size: 13, color: "rgba(255,184,0,0.7)",  delay: "0.5s"  },
  { id: 3, top: "68%", left: "28%", size: 9,  color: "rgba(0,255,157,0.7)", delay: "1s"    },
  { id: 4, top: "20%", left: "72%", size: 7,  color: "rgba(255,61,90,0.5)", delay: "0.3s"  },
];

// Admin mock data
export const ADMIN_USERS = [
  { id: 1, name: "Priya Sharma",   email: "priya@health.gov", role: "user",  status: "active",   joined: "Jan 2024", location: "Chandigarh" },
  { id: 2, name: "Rahul Verma",    email: "rahul@ncdc.in",    role: "admin", status: "active",   joined: "Nov 2023", location: "Delhi"       },
  { id: 3, name: "Anita Singh",    email: "anita@who.int",    role: "user",  status: "active",   joined: "Mar 2024", location: "Ludhiana"    },
  { id: 4, name: "Dev Kapoor",     email: "dev@idsp.gov",     role: "user",  status: "inactive", joined: "Feb 2024", location: "Amritsar"    },
  { id: 5, name: "Meera Joshi",    email: "meera@health.gov", role: "admin", status: "active",   joined: "Dec 2023", location: "Mohali"      },
];

export const ADMIN_REPORTS = [
  { id: 1, title: "IDSP Week 12 Summary",   source: "IDSP",  date: "29 Mar 2026", status: "processed", alerts: 3 },
  { id: 2, title: "WHO India Bulletin #48", source: "WHO",   date: "27 Mar 2026", status: "processed", alerts: 1 },
  { id: 3, title: "Punjab State Report Q1", source: "State", date: "25 Mar 2026", status: "pending",   alerts: 0 },
  { id: 4, title: "NCDC Surveillance #201", source: "NCDC",  date: "22 Mar 2026", status: "processed", alerts: 2 },
];

export const SUPERADMIN_SYSTEM = {
  uptime: "99.97%",
  apiCalls: "142,830",
  storageUsed: "68%",
  activeUsers: 1247,
  admins: 5,
  totalUsers: 1253,
  reportsProcessed: 2847,
};

export const getBotResponse = (input) => {
  const l = input.toLowerCase();

  if (l.includes("dengue") || l.includes("mosquito"))
    return { type: "list",    text: "🦟 **Dengue Alert — Chandigarh & Mohali**\n\nNCDC-recommended precautions:", items: ["Use DEET-based repellent, especially at dawn/dusk", "Wear full-sleeve clothing during peak mosquito hours", "Eliminate stagnant water around your home weekly", "Use bed nets — Aedes mosquitoes bite in daytime too", "Seek care immediately if fever + rash + joint pain"], follow: "Dengue cases are **+24% this week** in your district. Should I set up daily alerts? 🔔" };

  if (l.includes("summary") || l.includes("report") || l.includes("week"))
    return { type: "bullets",  text: "📊 **IDSP Week 12 Summary — Punjab & Haryana**", items: ["**Dengue (312 cases)**: Highest burden in Mohali–Panchkula corridor.", "**Influenza H3N2 (189 cases)**: Seasonal surge, elderly & children at risk.", "**Typhoid (97 cases)**: Linked to contaminated water in 3 Jalandhar wards.", "**Cholera Watch**: 11 suspected cases in rural Punjab — under investigation."], follow: "Sourced from IDSP, WHO India & State Directorate. Last updated: Today, 9:00 AM." };

  if (l.includes("precaution") || l.includes("prevent") || l.includes("safe"))
    return { type: "list",    text: "🛡️ **General Precautions — Chandigarh Region**", items: ["Boil or purify drinking water — typhoid risk elevated", "Use mosquito protection — dengue is at seasonal peak", "Wash hands frequently — flu is airborne", "Avoid crowded spaces if symptomatic", "Keep vaccinations up to date (flu, typhoid)"], follow: "Want a location-specific risk report? Share your exact district." };

  return { type: "card", text: "Based on **IDSP Week 12 Report**, here are active disease alerts near you:", card: { title: "🦠 Disease Risk — Chandigarh Region", risks: [{ label: "Dengue", val: 72, bar: "bg-red-500" }, { label: "Influenza", val: 55, bar: "bg-yellow-400" }, { label: "Typhoid", val: 38, bar: "bg-orange-400" }, { label: "Cholera", val: 15, bar: "bg-purple-400" }] }, follow: "Dengue is the highest concern this week. Want **precautions**, **health centers**, or a **full report**?" };
};
