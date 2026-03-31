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
  const text = input.toLowerCase().trim();

  if (!text) {
    return {
      text: "I am here. Ask me anything about health, symptoms, prevention, or general care.",
    };
  }

  if (["hi", "hey", "hello", "hii", "hey there"].some((greeting) => text === greeting || text.startsWith(`${greeting} `))) {
    return {
      text: "Hey! I'm Mr.Vital. How can I help you today?",
    };
  }

  if (text.includes("how are you")) {
    return {
      text: "I'm doing well and ready to help. Tell me what health question you have.",
    };
  }

  if (text.includes("dengue")) {
    return {
      text: "Dengue usually causes high fever, headache, body pain, nausea, and sometimes rash. Drink fluids, rest, and see a doctor if symptoms get worse.",
    };
  }

  if (text.includes("fever")) {
    return {
      text: "For fever, rest, drink plenty of fluids, and monitor your temperature. If it stays high, lasts more than a couple of days, or comes with breathing trouble, confusion, or severe weakness, get medical help.",
    };
  }

  if (text.includes("cough") || text.includes("cold") || text.includes("flu")) {
    return {
      text: "For cough or flu-like symptoms, rest, hydrate well, and avoid close contact with others. If you have chest pain, breathing trouble, or symptoms are getting worse, please see a doctor.",
    };
  }

  if (text.includes("hospital") || text.includes("doctor") || text.includes("clinic")) {
    return {
      text: "If you need care, I can help with general guidance, but for urgent symptoms it is best to visit the nearest hospital or clinic as soon as possible.",
    };
  }

  if (text.includes("prevent") || text.includes("precaution") || text.includes("safe")) {
    return {
      text: "Basic prevention steps are washing hands regularly, drinking clean water, avoiding stagnant water, eating safe food, and seeking care early if symptoms appear.",
    };
  }

  return {
    text: "I can help with symptoms, prevention, common illnesses, first-aid basics, and general healthcare questions. Tell me what you want to know.",
  };
};
