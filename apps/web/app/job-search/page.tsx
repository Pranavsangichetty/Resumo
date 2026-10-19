"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  location: string;
  isRemote: boolean;
  type: string;
  salary: string;
  description: string;
  tags: string[];
  applyUrl: string;
  postedAt: string | null;
  source: string;
}

// ─── Location data ────────────────────────────────────────────────────────────
const INDIA_CITIES = [
  "Bengaluru", "Mumbai", "Hyderabad", "Pune", "Chennai", "Delhi", "Noida",
  "Gurugram", "Kolkata", "Ahmedabad", "Jaipur", "Indore", "Coimbatore",
  "Kochi", "Nagpur", "Bhubaneswar", "Chandigarh", "Mysuru", "Vadodara",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function typeBadgeClass(type: string) {
  switch (type) {
    case "Remote":      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
    case "Hybrid":      return "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400";
    case "Contract":    return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400";
    case "Part-Time":   return "bg-pink-500/10 border-pink-500/20 text-pink-600 dark:text-pink-400";
    case "Internship":  return "bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400";
    default:            return "bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400";
  }
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7)  return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}



// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 animate-pulse">
      <div className="flex gap-4 items-start">
        <div className="h-11 w-11 rounded-xl bg-[var(--bg-muted)] shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/5 rounded bg-[var(--bg-muted)]" />
          <div className="h-3 w-1/4 rounded bg-[var(--bg-muted)]" />
          <div className="h-3 w-3/4 rounded bg-[var(--bg-muted)] mt-3" />
          <div className="h-3 w-2/3 rounded bg-[var(--bg-muted)]" />
          <div className="flex gap-1.5 pt-2">
            {[60, 80, 50, 70].map((w, i) => (
              <div key={i} style={{ width: w }} className="h-5 rounded bg-[var(--bg-muted)]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Location Picker ──────────────────────────────────────────────────────────
function LocationPicker({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const select = (v: string) => { onChange(v); setOpen(false); };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-2.5 text-sm outline-none hover:border-blue-500 transition w-[170px]"
      >
        <svg className="shrink-0 text-[var(--text-muted)]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span className={`truncate flex-1 text-left text-sm ${!value ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>
          {value || "Location (India)"}
        </span>
        <svg className="shrink-0 text-[var(--text-muted)]" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-64 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-1">Popular Cities</p>
          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
            <button onClick={() => select("")}
              className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] transition">
              All India
            </button>
            {INDIA_CITIES.map((c) => (
              <button key={c} onClick={() => select(c)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${value === c ? "bg-blue-600/20 text-blue-400" : "text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"}`}>
                {c}
              </button>
            ))}
          </div>

          <div className="border-t border-[var(--border)] mt-2 pt-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 px-1">Custom City</p>
            <div className="flex gap-1.5">
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && custom.trim() && select(custom.trim())}
                placeholder="Type a city..."
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-blue-500"
              />
              <button onClick={() => custom.trim() && select(custom.trim())}
                className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition">
                Go
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const JOB_TYPE_MAP: Record<string, string> = {
  "Full-Time":  "FULLTIME",
  "Part-Time":  "PARTTIME",
  "Contract":   "CONTRACTOR",
  "Remote":     "FULLTIME",
  "Hybrid":     "FULLTIME",
  "Internship": "INTERN",
};

const DATE_OPTIONS = [
  { label: "Any time",    value: "all" },
  { label: "Today",       value: "today" },
  { label: "Last 3 days", value: "3days" },
  { label: "This week",   value: "week" },
  { label: "This month",  value: "month" },
];

// ─── Company Careers Portals ──────────────────────────────────────────────────
const COMPANY_CAREERS: Record<string, string> = {
  "tata consultancy services": "https://www.tcs.com/careers",
  "tcs": "https://www.tcs.com/careers",
  "infosys": "https://career.infosys.com/",
  "razorpay": "https://razorpay.com/jobs/",
  "hcl technologies": "https://www.hcltech.com/careers",
  "hcl": "https://www.hcltech.com/careers",
  "paytm": "https://paytm.com/careers",
  "meesho": "https://meesho.io/jobs",
  "freshworks": "https://www.freshworks.com/company/careers/",
  "zomato": "https://www.zomato.com/careers",
  "ola": "https://olaelectric.com/careers",
  "ola electric": "https://olaelectric.com/careers",
  "nykaa": "https://www.nykaa.com/careers",
  "wipro": "https://careers.wipro.com/",
  "swiggy": "https://careers.swiggy.com/",
  "makemytrip": "https://careers.makemytrip.com/",
  "walmart global tech": "https://careers.walmart.com/",
  "walmart": "https://careers.walmart.com/",
  "myntra": "https://careers.myntra.com/",
  "zepto": "https://www.zepto.co/careers",
  "groww": "https://groww.in/careers",
  "cred": "https://careers.cred.club/",
  "google india": "https://www.google.com/about/careers/applications/jobs/results/?location=India",
  "google": "https://www.google.com/about/careers/applications/jobs/results/?location=India",
  "accenture india": "https://www.accenture.com/in-en/careers",
  "accenture": "https://www.accenture.com/in-en/careers",
  "browserstack": "https://www.browserstack.com/careers",
  "sarvam ai": "https://www.sarvam.ai/careers",
  "nvidia india": "https://www.nvidia.com/en-us/about-nvidia/careers/",
  "nvidia": "https://www.nvidia.com/en-us/about-nvidia/careers/",
  "flipkart": "https://www.flipkartcareers.com/",
  "microsoft india": "https://careers.microsoft.com/v2/global/en/home.html",
  "microsoft": "https://careers.microsoft.com/v2/global/en/home.html",
  "airtel": "https://www.airtel.in/careers/",
  "deloitte india": "https://www2.deloitte.com/ui/en/pages/careers/articles/life-at-deloitte-india.html",
  "deloitte": "https://www2.deloitte.com/ui/en/pages/careers/articles/life-at-deloitte-india.html",
  "hdfc bank": "https://www.hdfcbank.com/personal/about-us/careers",
  "juspay": "https://juspay.in/careers",
  "inmobi": "https://www.inmobi.com/company/careers/",
  "phonepe": "https://www.phonepe.com/careers/",
  "navi": "https://navi.com/careers",
  "sharechat": "https://sharechat.com/careers",
  "krutrim ai": "https://www.olakrutrim.com/",
  "amazon india": "https://www.amazon.jobs/en/locations/india",
  "amazon": "https://www.amazon.jobs/en/locations/india",
  "ixigo": "https://www.ixigo.com/careers",
  "byju's": "https://byjus.com/careers/",
  "zerodha": "https://zerodha.com/careers/",
  "icici bank": "https://www.icicicareers.com/",
  "urban company": "https://careers.urbancompany.com/",
  "info edge (naukri)": "https://www.infoedge.in/careers.html",
  "info edge": "https://www.infoedge.in/careers.html",
  "naukri": "https://www.naukri.com/",
  "zoho": "https://www.zoho.com/careers/",
  "delhivery": "https://www.delhivery.com/careers/",
  "reliance retail": "https://www.relianceretail.com/careers.html",
  "reliance": "https://www.relianceretail.com/careers.html",
  "leadsquared": "https://www.leadsquared.com/careers/",
  "upgrad": "https://www.upgrad.com/careers/",
  "scaler": "https://www.scaler.com/careers/",
};

function getApplyUrl(job: Job): string {
  if (job.applyUrl && job.applyUrl.startsWith("http")) {
    return job.applyUrl;
  }
  const clean = (job.company || "").toLowerCase().trim();
  for (const [k, url] of Object.entries(COMPANY_CAREERS)) {
    if (clean.includes(k) || k.includes(clean)) {
      return url;
    }
  }
  return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(`${job.company} ${job.title}`)}`;
}

// ─── Fallback sample jobs — 60+ roles across all categories ──────────────────
const SAMPLE_INDIA_JOBS: Job[] = [
  // ── Software Engineering ──────────────────────────────────────────────────
  { id:"s1",  title:"Senior Software Engineer – Full Stack", company:"Tata Consultancy Services", companyLogo:null, location:"Bengaluru, Karnataka", isRemote:false, type:"Full-Time",   salary:"₹18L – ₹28L / year",          description:"Build enterprise-grade web platforms using React, Node.js and AWS for global Fortune 500 clients.",                                                           tags:["React","Node.js","AWS","TypeScript","PostgreSQL"],                    applyUrl:"https://www.tcs.com/careers", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },
  { id:"s2",  title:"Backend Developer (Python / Django)",   company:"Infosys",                   companyLogo:null, location:"Hyderabad, Telangana",    isRemote:false, type:"Full-Time",   salary:"₹14L – ₹22L / year",          description:"Design scalable REST APIs for Infosys BPM clients using Django REST Framework and Docker.",                                                               tags:["Python","Django","REST API","Docker","MySQL"],                        applyUrl:"https://career.infosys.com/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"s3",  title:"Frontend Engineer – React / Next.js",  company:"Razorpay",                  companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:true,  type:"Remote",      salary:"₹22L – ₹38L / year",          description:"Build high-performance payment UIs used by millions of merchants daily using React and Next.js.",                                                       tags:["React","Next.js","TypeScript","Tailwind CSS","GraphQL"],              applyUrl:"https://razorpay.com/jobs/", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },
  { id:"s4",  title:"Java Backend Engineer",                 company:"HCL Technologies",          companyLogo:null, location:"Noida, Uttar Pradesh",    isRemote:false, type:"Full-Time",   salary:"₹12L – ₹20L / year",          description:"Develop microservices using Spring Boot and Kafka for banking and insurance enterprise clients.",                                                          tags:["Java","Spring Boot","Kafka","Microservices","Oracle DB"],             applyUrl:"https://www.hcltech.com/careers", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },
  { id:"s5",  title:"Android Developer (Kotlin)",           company:"Paytm",                     companyLogo:null, location:"Noida, Uttar Pradesh",    isRemote:false, type:"Full-Time",   salary:"₹16L – ₹26L / year",          description:"Maintain Paytm's Android super-app used by 350M+ users. Expertise in Kotlin and Jetpack Compose required.",                                              tags:["Kotlin","Jetpack Compose","MVVM","Retrofit","Room"],                  applyUrl:"https://paytm.com/careers", postedAt:new Date(Date.now()-5*86400000).toISOString(), source:"Resumo" },
  { id:"s6",  title:"iOS Developer (Swift)",                company:"Meesho",                    companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹18L – ₹30L / year",          description:"Build Meesho's social commerce iOS app reaching tier-2 and tier-3 India. 3+ years Swift / SwiftUI required.",                                           tags:["Swift","SwiftUI","Combine","Core Data","Xcode"],                      applyUrl:"https://meesho.io/jobs", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },
  { id:"s7",  title:"Full Stack Developer (Contract)",      company:"Freshworks",                companyLogo:null, location:"Chennai, Tamil Nadu",      isRemote:true,  type:"Contract",    salary:"₹3,500 – ₹5,500 / day",       description:"6-month contract to build Freshdesk CRM modules using React and Ruby on Rails. Immediate joiners preferred.",                                            tags:["React","Ruby on Rails","PostgreSQL","Redis","AWS"],                   applyUrl:"https://www.freshworks.com/company/careers/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"s8",  title:"Software Engineering Intern",          company:"Zomato",                    companyLogo:null, location:"Gurugram, Haryana",        isRemote:false, type:"Internship",  salary:"₹50,000 – ₹70,000 / month",   description:"6-month internship on Zomato's order-management and logistics platform. B.Tech / M.Tech final-year students.",                                          tags:["Java","Spring Boot","React","MySQL","Redis"],                         applyUrl:"https://www.zomato.com/careers", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },
  { id:"s9",  title:"Go Developer",                         company:"Ola",                       companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹20L – ₹35L / year",          description:"Design high-throughput ride-matching and dispatch services in Go for Ola's mobility platform.",                                                           tags:["Go","gRPC","Kubernetes","Cassandra","Redis"],                         applyUrl:"https://olaelectric.com/careers", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"s10", title:"PHP Laravel Developer",                company:"Nykaa",                     companyLogo:null, location:"Mumbai, Maharashtra",      isRemote:false, type:"Full-Time",   salary:"₹10L – ₹18L / year",          description:"Build and maintain Nykaa's e-commerce backend using PHP Laravel, MySQL, and Elasticsearch.",                                                              tags:["PHP","Laravel","MySQL","Elasticsearch","Redis"],                      applyUrl:"https://www.nykaa.com/careers", postedAt:new Date(Date.now()-4*86400000).toISOString(), source:"Resumo" },
  { id:"s11", title:"Cloud Architect – AWS",                company:"Wipro",                     companyLogo:null, location:"Chennai, Tamil Nadu",      isRemote:false, type:"Full-Time",   salary:"₹30L – ₹50L / year",          description:"Lead cloud migration for global enterprise clients. AWS Solutions Architect Professional certification required.",                                         tags:["AWS","Terraform","Microservices","Security","Cost Optimisation"],     applyUrl:"https://careers.wipro.com/", postedAt:new Date(Date.now()-6*86400000).toISOString(), source:"Resumo" },

  // ── Data Science / Analytics ──────────────────────────────────────────────
  { id:"d1",  title:"Data Scientist – NLP",                 company:"Swiggy",                    companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹24L – ₹40L / year",          description:"Build NLP models for restaurant reviews, search ranking and personalisation at Swiggy scale.",                                                            tags:["Python","NLP","BERT","Scikit-learn","SpaCy"],                         applyUrl:"https://careers.swiggy.com/", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },
  { id:"d2",  title:"Data Scientist – Computer Vision",     company:"MakeMyTrip",                companyLogo:null, location:"Gurugram, Haryana",        isRemote:false, type:"Full-Time",   salary:"₹20L – ₹35L / year",          description:"Apply computer vision to hotel image classification, fraud detection, and property verification.",                                                        tags:["Python","OpenCV","PyTorch","CNNs","AWS Rekognition"],                 applyUrl:"https://careers.makemytrip.com/", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },
  { id:"d3",  title:"Senior Data Scientist",                company:"Walmart Global Tech",       companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹30L – ₹50L / year",          description:"Lead demand forecasting, pricing optimisation and assortment planning using advanced ML techniques.",                                                     tags:["Python","R","Machine Learning","SQL","Tableau"],                      applyUrl:"https://careers.walmart.com/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"d4",  title:"Data Science Intern",                  company:"Ola Electric",              companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Internship",  salary:"₹40,000 – ₹60,000 / month",   description:"Build predictive battery health models for Ola's electric vehicle fleet. Final-year students.",                                                          tags:["Python","Pandas","Scikit-learn","Jupyter","SQL"],                     applyUrl:"https://olaelectric.com/careers", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },
  { id:"d5",  title:"Business Analyst – Data",              company:"Myntra",                    companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹12L – ₹20L / year",          description:"Translate fashion business problems into data-driven insights using SQL, Python and Power BI.",                                                          tags:["SQL","Python","Power BI","Excel","Data Storytelling"],                applyUrl:"https://careers.myntra.com/", postedAt:new Date(Date.now()-4*86400000).toISOString(), source:"Resumo" },
  { id:"d6",  title:"Data Analyst",                         company:"Zepto",                     companyLogo:null, location:"Mumbai, Maharashtra",      isRemote:false, type:"Full-Time",   salary:"₹10L – ₹16L / year",          description:"Analyse dark-store operations data to improve order fulfilment speed, reduce wastage and grow GMV.",                                                     tags:["SQL","Python","Looker","Excel","A/B Testing"],                        applyUrl:"https://www.zepto.co/careers", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"d7",  title:"Quantitative Analyst",                 company:"Groww",                     companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹22L – ₹40L / year",          description:"Develop quantitative trading strategies and risk models for Groww's mutual fund and stock platforms.",                                                     tags:["Python","R","Statistics","Financial Modelling","SQL"],                applyUrl:"https://groww.in/careers", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },
  { id:"d8",  title:"Data Engineer",                        company:"Swiggy",                    companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹20L – ₹32L / year",          description:"Design petabyte-scale data pipelines for Swiggy's food-delivery and quick-commerce using Spark and Kafka.",                                              tags:["Apache Spark","Kafka","Python","Airflow","BigQuery"],                 applyUrl:"https://careers.swiggy.com/", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },

  // ── AI / Machine Learning ─────────────────────────────────────────────────
  { id:"a1",  title:"Machine Learning Engineer",            company:"CRED",                      companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:true,  type:"Hybrid",      salary:"₹28L – ₹45L / year",          description:"Build credit-risk, fraud-detection and recommendation models at scale using PyTorch and MLOps.",                                                         tags:["Python","PyTorch","MLOps","Kubernetes","SQL"],                        applyUrl:"https://careers.cred.club/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"a2",  title:"AI/ML Research Engineer",              company:"Google India",               companyLogo:null, location:"Hyderabad, Telangana",    isRemote:false, type:"Full-Time",   salary:"₹45L – ₹90L / year",          description:"Research and productionise large language models and multimodal AI systems for Google's product suite.",                                                  tags:["Python","TensorFlow","JAX","LLMs","Research"],                        applyUrl:"https://www.google.com/about/careers/applications/jobs/results/?location=India", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },
  { id:"a3",  title:"Generative AI Engineer",               company:"Accenture India",           companyLogo:null, location:"Pune, Maharashtra",        isRemote:true,  type:"Hybrid",      salary:"₹20L – ₹38L / year",          description:"Build enterprise GenAI solutions using LLMs, RAG pipelines and prompt engineering for Fortune 500 clients.",                                             tags:["LangChain","OpenAI","RAG","Python","Vector DBs"],                     applyUrl:"https://www.accenture.com/in-en/careers", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"a4",  title:"MLOps Engineer",                       company:"BrowserStack",              companyLogo:null, location:"Mumbai, Maharashtra",      isRemote:false, type:"Full-Time",   salary:"₹22L – ₹36L / year",          description:"Design and maintain ML infrastructure, model serving pipelines, and monitoring systems.",                                                                tags:["MLflow","Kubeflow","Docker","Python","Prometheus"],                   applyUrl:"https://www.browserstack.com/careers", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },
  { id:"a5",  title:"AI Product Engineer – LLM",            company:"Sarvam AI",                 companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:true,  type:"Remote",      salary:"₹30L – ₹55L / year",          description:"Work on India's open-source LLM for Indian languages. Fine-tune, evaluate and deploy models at scale.",                                                   tags:["Python","Transformers","RLHF","Indic NLP","FastAPI"],                 applyUrl:"https://www.sarvam.ai/careers", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },
  { id:"a6",  title:"Deep Learning Engineer",               company:"Nvidia India",              companyLogo:null, location:"Pune, Maharashtra",        isRemote:false, type:"Full-Time",   salary:"₹35L – ₹65L / year",          description:"Design and optimise deep learning models for GPU-accelerated inference on Nvidia's CUDA platform.",                                                       tags:["CUDA","PyTorch","C++","Deep Learning","TensorRT"],                    applyUrl:"https://www.nvidia.com/en-us/about-nvidia/careers/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },

  // ── DevOps / Cloud / Infra ────────────────────────────────────────────────
  { id:"i1",  title:"DevOps Engineer",                      company:"Flipkart",                  companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹18L – ₹30L / year",          description:"Own CI/CD infrastructure, Kubernetes clusters and cloud cost-optimisation for Flipkart's 400M+ user platform.",                                         tags:["Kubernetes","Terraform","AWS","CI/CD","Go"],                          applyUrl:"https://www.flipkartcareers.com/", postedAt:new Date(Date.now()-4*86400000).toISOString(), source:"Resumo" },
  { id:"i2",  title:"Site Reliability Engineer (SRE)",      company:"Microsoft India",           companyLogo:null, location:"Hyderabad, Telangana",    isRemote:false, type:"Full-Time",   salary:"₹28L – ₹50L / year",          description:"Ensure reliability and performance of Azure cloud services at a massive global scale.",                                                                   tags:["Azure","Kubernetes","Python","Prometheus","Grafana"],                 applyUrl:"https://careers.microsoft.com/v2/global/en/home.html", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"i3",  title:"Network Engineer",                     company:"Airtel",                    companyLogo:null, location:"Delhi, Delhi",             isRemote:false, type:"Full-Time",   salary:"₹10L – ₹18L / year",          description:"Design, deploy and maintain Airtel's 5G and fibre network infrastructure across India.",                                                                 tags:["Networking","CCNA","BGP","MPLS","Network Security"],                  applyUrl:"https://www.airtel.in/careers/", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },

  // ── Cybersecurity ─────────────────────────────────────────────────────────
  { id:"c1",  title:"Cybersecurity Analyst",                company:"Deloitte India",            companyLogo:null, location:"Mumbai, Maharashtra",      isRemote:false, type:"Full-Time",   salary:"₹12L – ₹22L / year",          description:"Monitor, detect and respond to cyber threats for Deloitte's enterprise clients. SIEM and SOC experience required.",                                       tags:["SIEM","SOC","Incident Response","OWASP","Python"],                    applyUrl:"https://www2.deloitte.com/ui/en/pages/careers/articles/life-at-deloitte-india.html", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"c2",  title:"Penetration Tester",                   company:"Razorpay",                  companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹18L – ₹32L / year",          description:"Conduct web, mobile and API penetration testing for Razorpay's fintech infrastructure. CEH / OSCP preferred.",                                          tags:["Penetration Testing","Burp Suite","OWASP","Linux","Python"],          applyUrl:"https://razorpay.com/jobs/", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },
  { id:"c3",  title:"Information Security Engineer",        company:"HDFC Bank",                 companyLogo:null, location:"Mumbai, Maharashtra",      isRemote:false, type:"Full-Time",   salary:"₹16L – ₹28L / year",          description:"Implement information security policies, vulnerability management and compliance frameworks.",                                                             tags:["ISO 27001","VAPT","Firewall","DLP","Risk Management"],                applyUrl:"https://www.hdfcbank.com/personal/about-us/careers", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },

  // ── UI / UX Design ────────────────────────────────────────────────────────
  { id:"u1",  title:"Product Designer (UI/UX)",             company:"Swiggy",                    companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹18L – ₹32L / year",          description:"Design end-to-end product experiences for Swiggy's consumer, restaurant and delivery apps.",                                                            tags:["Figma","User Research","Prototyping","Design Systems","Usability Testing"], applyUrl:"https://careers.swiggy.com/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"u2",  title:"UX Researcher",                        company:"Flipkart",                  companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹15L – ₹26L / year",          description:"Conduct user research studies, usability tests and interviews to inform Flipkart's product decisions.",                                                   tags:["User Research","Usability Testing","Surveys","Data Analysis","Figma"], applyUrl:"https://www.flipkartcareers.com/", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },
  { id:"u3",  title:"UI Designer – Mobile",                 company:"Juspay",                    companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:true,  type:"Hybrid",      salary:"₹12L – ₹20L / year",          description:"Create pixel-perfect mobile UI for Juspay's payments SDK used by Amazon, Flipkart and Jio.",                                                            tags:["Figma","Sketch","iOS HIG","Material Design","Prototyping"],           applyUrl:"https://juspay.in/careers", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },
  { id:"u4",  title:"UI/UX Intern",                         company:"InMobi",                    companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Internship",  salary:"₹20,000 – ₹35,000 / month",   description:"Assist senior designers in creating ad platform interfaces and conducting competitive design analysis.",                                                   tags:["Figma","Adobe XD","Wireframing","UI Design","Prototyping"],           applyUrl:"https://www.inmobi.com/company/careers/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },

  // ── Product Management ────────────────────────────────────────────────────
  { id:"p1",  title:"Product Manager – Fintech",            company:"PhonePe",                   companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹32L – ₹55L / year",          description:"Define and execute product roadmap for PhonePe's lending and insurance verticals.",                                                                       tags:["Product Strategy","SQL","A/B Testing","Fintech","Agile"],             applyUrl:"https://www.phonepe.com/careers/", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },
  { id:"p2",  title:"Associate Product Manager",            company:"Navi",                      companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹18L – ₹30L / year",          description:"Own loan origination funnel and drive user growth for Navi's digital lending platform.",                                                                  tags:["Product Management","SQL","User Research","Agile","Jira"],            applyUrl:"https://navi.com/careers", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"p3",  title:"Senior Product Manager – Growth",      company:"ShareChat",                 companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹35L – ₹60L / year",          description:"Drive user acquisition, retention and monetisation for ShareChat's 180M monthly active users.",                                                           tags:["Growth Hacking","SQL","A/B Testing","Retention","Funnel Optimisation"], applyUrl:"https://sharechat.com/careers", postedAt:new Date(Date.now()-4*86400000).toISOString(), source:"Resumo" },
  { id:"p4",  title:"Product Manager – AI Platform",        company:"Krutrim AI",                companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:true,  type:"Remote",      salary:"₹40L – ₹70L / year",          description:"Shape the roadmap for Krutrim's AI platform, working with LLM research and enterprise customers.",                                                        tags:["AI/ML Products","LLMs","B2B SaaS","Roadmapping","API Products"],      applyUrl:"https://www.olakrutrim.com/", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },

  // ── QA / Testing ──────────────────────────────────────────────────────────
  { id:"q1",  title:"QA Engineer – Automation",             company:"BrowserStack",              companyLogo:null, location:"Mumbai, Maharashtra",      isRemote:false, type:"Full-Time",   salary:"₹12L – ₹22L / year",          description:"Build and maintain automation test frameworks for web and mobile using Selenium and Appium.",                                                             tags:["Selenium","Appium","Java","TestNG","CI/CD"],                          applyUrl:"https://www.browserstack.com/careers", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"q2",  title:"SDET – Performance Testing",           company:"Amazon India",              companyLogo:null, location:"Hyderabad, Telangana",    isRemote:false, type:"Full-Time",   salary:"₹20L – ₹38L / year",          description:"Design and execute performance and load testing strategies for Amazon's checkout and fulfilment systems.",                                                 tags:["JMeter","Gatling","Python","AWS","Load Testing"],                     applyUrl:"https://www.amazon.jobs/en/locations/india", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },
  { id:"q3",  title:"Manual QA Tester",                     company:"Ixigo",                     companyLogo:null, location:"Gurugram, Haryana",        isRemote:false, type:"Full-Time",   salary:"₹6L – ₹12L / year",           description:"Perform functional, regression and exploratory testing for Ixigo's travel booking web and mobile apps.",                                                  tags:["Manual Testing","Bug Tracking","JIRA","Test Cases","API Testing"],    applyUrl:"https://www.ixigo.com/careers", postedAt:new Date(Date.now()-4*86400000).toISOString(), source:"Resumo" },

  // ── Finance / Accounting ──────────────────────────────────────────────────
  { id:"f1",  title:"Chartered Accountant – Finance",       company:"Byju's",                    companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹14L – ₹22L / year",          description:"Manage financial reporting, statutory compliance and audit coordination for Byju's global entities.",                                                    tags:["CA","Financial Reporting","IFRS","Audit","Tally"],                    applyUrl:"https://byjus.com/careers/", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },
  { id:"f2",  title:"Financial Analyst",                    company:"Zerodha",                   companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹12L – ₹20L / year",          description:"Analyse financial performance, prepare investor reports and support strategic finance decisions.",                                                        tags:["Financial Modelling","Excel","SQL","Power BI","Valuation"],           applyUrl:"https://zerodha.com/careers/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"f3",  title:"Finance & Accounts Intern",            company:"Razorpay",                  companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Internship",  salary:"₹25,000 – ₹40,000 / month",   description:"Assist with GST filing, financial reconciliation and month-end closing processes.",                                                                       tags:["GST","Tally","Excel","Reconciliation","Accounting"],                  applyUrl:"https://razorpay.com/jobs/", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },
  { id:"f4",  title:"Risk & Compliance Manager",            company:"ICICI Bank",                companyLogo:null, location:"Mumbai, Maharashtra",      isRemote:false, type:"Full-Time",   salary:"₹20L – ₹35L / year",          description:"Oversee credit risk, operational risk and RBI regulatory compliance for ICICI Bank's retail division.",                                                  tags:["Risk Management","RBI Compliance","FEMA","Credit Risk","Basel III"],  applyUrl:"https://www.icicicareers.com/", postedAt:new Date(Date.now()-4*86400000).toISOString(), source:"Resumo" },

  // ── Human Resources ───────────────────────────────────────────────────────
  { id:"h1",  title:"HR Business Partner",                  company:"Infosys",                   companyLogo:null, location:"Pune, Maharashtra",        isRemote:false, type:"Full-Time",   salary:"₹12L – ₹20L / year",          description:"Partner with business leaders on talent planning, performance management and employee engagement.",                                                       tags:["HRBP","Talent Management","Performance Management","HRMS","Labour Law"], applyUrl:"https://career.infosys.com/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"h2",  title:"Technical Recruiter",                  company:"Razorpay",                  companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹10L – ₹18L / year",          description:"Own end-to-end engineering hiring for Razorpay — source, screen and close top tech talent at scale.",                                                    tags:["Technical Recruiting","Boolean Search","ATS","Employer Branding","Stakeholder Management"], applyUrl:"https://razorpay.com/jobs/", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },
  { id:"h3",  title:"L&D Specialist",                       company:"Wipro",                     companyLogo:null, location:"Hyderabad, Telangana",    isRemote:true,  type:"Hybrid",      salary:"₹8L – ₹15L / year",           description:"Design and deliver learning programs for Wipro's 220,000+ employees across technical and behavioural skills.",                                           tags:["Instructional Design","LMS","E-learning","Facilitation","ADDIE"],     applyUrl:"https://careers.wipro.com/", postedAt:new Date(Date.now()-4*86400000).toISOString(), source:"Resumo" },

  // ── Marketing / Growth ────────────────────────────────────────────────────
  { id:"m1",  title:"Digital Marketing Manager",            company:"Urban Company",             companyLogo:null, location:"Gurugram, Haryana",        isRemote:false, type:"Full-Time",   salary:"₹12L – ₹22L / year",          description:"Own performance marketing campaigns across Google, Meta and YouTube to drive Urban Company's home services growth.",                                      tags:["Google Ads","Meta Ads","SEO","Analytics","CRM"],                      applyUrl:"https://careers.urbancompany.com/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"m2",  title:"SEO Specialist",                       company:"Info Edge (Naukri)",         companyLogo:null, location:"Noida, Uttar Pradesh",    isRemote:false, type:"Full-Time",   salary:"₹8L – ₹15L / year",           description:"Drive organic traffic growth for Naukri.com through on-page, off-page and technical SEO strategies.",                                                    tags:["SEO","Google Search Console","Ahrefs","Content Strategy","Technical SEO"], applyUrl:"https://www.infoedge.in/careers.html", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },
  { id:"m3",  title:"Content Marketing Writer",             company:"Zoho",                      companyLogo:null, location:"Chennai, Tamil Nadu",      isRemote:true,  type:"Remote",      salary:"₹7L – ₹13L / year",           description:"Create long-form content, case studies and product documentation for Zoho's SaaS product portfolio.",                                                    tags:["Content Writing","SEO Writing","B2B Marketing","WordPress","Grammarly"], applyUrl:"https://www.zoho.com/careers/", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },
  { id:"m4",  title:"Growth Marketing Intern",              company:"CRED",                      companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Internship",  salary:"₹30,000 – ₹50,000 / month",   description:"Assist with performance marketing experiments, cohort analysis and A/B testing for user acquisition.",                                                    tags:["Google Ads","A/B Testing","SQL","Excel","Analytics"],                 applyUrl:"https://careers.cred.club/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"m5",  title:"Brand Manager",                        company:"Nykaa",                     companyLogo:null, location:"Mumbai, Maharashtra",      isRemote:false, type:"Full-Time",   salary:"₹15L – ₹25L / year",          description:"Own brand strategy and campaign execution for Nykaa's private label beauty and fashion brands.",                                                         tags:["Brand Strategy","Campaign Management","P&L Management","Agencies","Market Research"], applyUrl:"https://www.nykaa.com/careers", postedAt:new Date(Date.now()-4*86400000).toISOString(), source:"Resumo" },

  // ── Sales / Business Development ──────────────────────────────────────────
  { id:"b1",  title:"Sales Manager – B2B SaaS",             company:"Zoho",                      companyLogo:null, location:"Chennai, Tamil Nadu",      isRemote:false, type:"Full-Time",   salary:"₹12L – ₹22L / year",          description:"Own the complete B2B sales cycle for Zoho One suite — prospecting to closing enterprise deals.",                                                         tags:["B2B Sales","SaaS","CRM","Negotiation","Pipeline Management"],         applyUrl:"https://www.zoho.com/careers/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"b2",  title:"Business Development Executive",       company:"Meesho",                    companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹7L – ₹14L / year",           description:"Onboard new sellers onto Meesho's marketplace and drive their GMV growth through category expansion.",                                                    tags:["Business Development","Seller Onboarding","Negotiation","Excel","Market Research"], applyUrl:"https://meesho.io/jobs", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },
  { id:"b3",  title:"Enterprise Account Executive",         company:"Freshworks",                companyLogo:null, location:"Hyderabad, Telangana",    isRemote:true,  type:"Remote",      salary:"₹18L – ₹35L / year",          description:"Manage and grow enterprise accounts for Freshsales CRM across BFSI and manufacturing verticals.",                                                         tags:["Enterprise Sales","CRM","Solution Selling","Account Management","SaaS"], applyUrl:"https://www.freshworks.com/company/careers/", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },

  // ── Operations / Supply Chain ─────────────────────────────────────────────
  { id:"o1",  title:"Operations Manager – Logistics",       company:"Delhivery",                 companyLogo:null, location:"Gurugram, Haryana",        isRemote:false, type:"Full-Time",   salary:"₹14L – ₹24L / year",          description:"Manage last-mile delivery operations for Delhivery's network covering 2,300+ cities.",                                                                   tags:["Logistics","Supply Chain","SLA Management","Excel","Operations"],     applyUrl:"https://www.delhivery.com/careers/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"o2",  title:"Supply Chain Analyst",                 company:"Reliance Retail",           companyLogo:null, location:"Mumbai, Maharashtra",      isRemote:false, type:"Full-Time",   salary:"₹10L – ₹18L / year",          description:"Analyse inventory, demand forecasting and vendor performance for Reliance's retail network.",                                                           tags:["Supply Chain","SAP","Excel","SQL","Demand Forecasting"],              applyUrl:"https://www.relianceretail.com/careers.html", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },

  // ── Customer Success ──────────────────────────────────────────────────────
  { id:"cs1", title:"Customer Success Manager",             company:"Leadsquared",               companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:false, type:"Full-Time",   salary:"₹10L – ₹18L / year",          description:"Own onboarding, adoption and renewal of enterprise CRM clients in EdTech and BFSI verticals.",                                                           tags:["Customer Success","SaaS","CRM","NPS","Stakeholder Management"],       applyUrl:"https://www.leadsquared.com/careers/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"cs2", title:"Technical Support Engineer",           company:"Zoho",                      companyLogo:null, location:"Chennai, Tamil Nadu",      isRemote:false, type:"Full-Time",   salary:"₹6L – ₹12L / year",           description:"Resolve technical issues for Zoho's global customers via email, chat and video calls.",                                                                  tags:["Technical Support","REST APIs","MySQL","Troubleshooting","Zendesk"],  applyUrl:"https://www.zoho.com/careers/", postedAt:new Date(Date.now()-3*86400000).toISOString(), source:"Resumo" },

  // ── EdTech / Education ────────────────────────────────────────────────────
  { id:"e1",  title:"Curriculum Designer – Coding",         company:"upGrad",                    companyLogo:null, location:"Mumbai, Maharashtra",      isRemote:true,  type:"Remote",      salary:"₹10L – ₹18L / year",          description:"Design and develop programming curricula for upGrad's PG Data Science and Full Stack programmes.",                                                       tags:["Curriculum Design","Python","Data Science","LMS","Instructional Design"], applyUrl:"https://www.upgrad.com/careers/", postedAt:new Date(Date.now()-2*86400000).toISOString(), source:"Resumo" },
  { id:"e2",  title:"Academic Mentor – Data Science",       company:"Scaler",                    companyLogo:null, location:"Bengaluru, Karnataka",    isRemote:true,  type:"Part-Time",   salary:"₹800 – ₹1,500 / hour",        description:"Mentor Scaler students on Data Science projects, Python, ML algorithms and interview preparation.",                                                       tags:["Data Science","Python","Machine Learning","Mentoring","Statistics"],  applyUrl:"https://www.scaler.com/careers/", postedAt:new Date(Date.now()-1*86400000).toISOString(), source:"Resumo" },
];

export default function JobSearchPage() {
  const router = useRouter();

  // ── filter state ──
  const [keyword, setKeyword]     = useState("");
  const [location, setLocation]   = useState("");
  const [jobType, setJobType]     = useState("All");
  const [datePosted, setDatePosted] = useState("all");
  const [page, setPage]           = useState(1);

  // ── data state ──
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [loading, setLoading]     = useState(false);
  const [noKey, setNoKey]         = useState(false);
  const [hasMore, setHasMore]     = useState(true);

  // ── search ──
  const fetchJobs = useCallback(async (pg = 1, replace = true) => {
    setLoading(true);
    try {
      const locPart = location ? ` in ${location}, India` : " in India";
      const q = `${keyword || "software engineer"}${locPart}`;

      const params = new URLSearchParams({ query: q, page: String(pg), datePosted });

      if (jobType === "Remote") {
        params.set("remoteOnly", "true");
      } else if (jobType !== "All" && JOB_TYPE_MAP[jobType]) {
        params.set("jobType", JOB_TYPE_MAP[jobType]);
      }

      const res  = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();

      if (data.error === "RAPIDAPI_KEY not configured") {
        setNoKey(true);
        // Filter sample jobs client-side so filters still work
        const q = keyword.toLowerCase();
        const locQ = location.toLowerCase();
        const filtered = SAMPLE_INDIA_JOBS.filter((j) => {
          const matchQ = !q || j.title.toLowerCase().includes(q) ||
            j.company.toLowerCase().includes(q) ||
            j.tags.some((t) => t.toLowerCase().includes(q));
          const matchLoc = !locQ || j.location.toLowerCase().includes(locQ);
          const matchType = jobType === "All" || j.type === jobType ||
            (jobType === "Remote" && j.isRemote);
          return matchQ && matchLoc && matchType;
        });
        setJobs(filtered);
        setHasMore(false);
        return;
      }

      const fetched: Job[] = data.jobs ?? [];
      setJobs((prev) => replace ? fetched : [...prev, ...fetched]);
      setHasMore(fetched.length >= 10);
    } finally {
      setLoading(false);
    }
  }, [keyword, location, jobType, datePosted]);

  // initial load + re-fetch on filter change
  useEffect(() => {
    setPage(1);
    fetchJobs(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, jobType, datePosted]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchJobs(1, true);
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchJobs(next, false);
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] p-6 md:p-10 text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="border-b border-[var(--border)] pb-6 mb-8">
          <button onClick={() => router.push("/dashboard")}
            className="text-sm text-[var(--text-muted)] hover:text-blue-400 transition mb-2">
            ← Back to Dashboard
          </button>
          <div>
            <h1 className="text-3xl font-bold">Job Search &amp; Match Hub</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Explore curated job opportunities across India with real-time resume compatibility scoring.
            </p>
          </div>
        </div>

        {/* ── Portal Shortcuts ── */}
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Search directly on
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "LinkedIn",    dot: "#0A66C2", hoverBorder: "hover:border-[#0A66C2]", hoverText: "hover:text-[#0A66C2]", hoverBg: "hover:bg-[#0A66C2]/8",  url: (q:string) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q || "jobs")}&location=India` },
              { name: "Naukri",      dot: "#FF7555", hoverBorder: "hover:border-[#FF7555]", hoverText: "hover:text-[#FF7555]", hoverBg: "hover:bg-[#FF7555]/8",  url: (q:string) => `https://www.naukri.com/${encodeURIComponent((q||"jobs").replace(/\s+/g,"-").toLowerCase())}-jobs-in-india` },
              { name: "Internshala", dot: "#00A87B", hoverBorder: "hover:border-[#00A87B]", hoverText: "hover:text-[#00A87B]", hoverBg: "hover:bg-[#00A87B]/8",  url: (q:string) => `https://internshala.com/jobs/${encodeURIComponent((q||"").replace(/\s+/g,"-").toLowerCase())}` },
              { name: "Indeed",      dot: "#2164F3", hoverBorder: "hover:border-[#2164F3]", hoverText: "hover:text-[#2164F3]", hoverBg: "hover:bg-[#2164F3]/8",  url: (q:string) => `https://in.indeed.com/jobs?q=${encodeURIComponent(q||"jobs")}&l=India` },
              { name: "Wellfound",   dot: "#FB5D26", hoverBorder: "hover:border-[#FB5D26]", hoverText: "hover:text-[#FB5D26]", hoverBg: "hover:bg-[#FB5D26]/8",  url: (q:string) => `https://wellfound.com/jobs?q=${encodeURIComponent(q||"")}` },
              { name: "Turing",      dot: "#7C3AED", hoverBorder: "hover:border-[#7C3AED]", hoverText: "hover:text-[#7C3AED]", hoverBg: "hover:bg-[#7C3AED]/8",  url: (q:string) => `https://www.turing.com/jobs?search=${encodeURIComponent(q||"")}` },
              { name: "Glassdoor",   dot: "#0CAA41", hoverBorder: "hover:border-[#0CAA41]", hoverText: "hover:text-[#0CAA41]", hoverBg: "hover:bg-[#0CAA41]/8",  url: (q:string) => `https://www.glassdoor.co.in/Job/india-${encodeURIComponent((q||"jobs").replace(/\s+/g,"-").toLowerCase())}-jobs-SRCH_IL.0,5_IN115_KO6,${6+(q||"jobs").length}.htm` },
            ].map((portal) => (
              <a
                key={portal.name}
                href={portal.url(keyword)}
                target="_blank"
                rel="noreferrer"
                className={`group flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] transition-all duration-200 ${portal.hoverBorder} ${portal.hoverText} ${portal.hoverBg}`}
              >
                {/* Unique pulsing live-dot badge */}
                <span className="relative flex h-2 w-2 shrink-0">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-60 group-hover:animate-ping"
                    style={{ backgroundColor: portal.dot }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: portal.dot }}
                  />
                </span>
                {portal.name}
              </a>
            ))}
          </div>
        </div>


        {/* ── Filter Bar ── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 flex-wrap items-center">
            {/* Keyword search */}
            <div className="flex flex-1 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] overflow-hidden focus-within:border-blue-500 transition">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Role, skill, company… (e.g. React, Python, Infosys)"
                className="flex-1 min-w-0 bg-transparent px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              />
              <button type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-semibold shrink-0">
                Search
              </button>
            </div>

            {/* Location */}
            <LocationPicker value={location} onChange={setLocation} />

            {/* Job Type */}
            <select value={jobType} onChange={(e) => setJobType(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-blue-500 transition">
              <option value="All">All Job Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote Only</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Internship">Internship</option>
            </select>

            {/* Date posted */}
            <select value={datePosted} onChange={(e) => setDatePosted(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-blue-500 transition">
              {DATE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </form>
        </div>



        {/* ── Results ── */}
        <div className="space-y-4">
          {/* Loading skeletons */}
          {loading && jobs.length === 0 &&
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}

          {/* Job cards */}
          {jobs.map((job) => (
            <div key={job.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 hover:border-blue-500/40 transition group">
              <div className="flex gap-4 items-start">
                {/* Logo */}
                <div className="h-11 w-11 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] shrink-0 flex items-center justify-center overflow-hidden">
                  {job.companyLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={job.companyLogo} alt={job.company} className="h-full w-full object-contain p-1" />
                  ) : (
                    <span className="text-lg font-bold text-[var(--text-muted)]">
                      {job.company.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-blue-400 transition">
                      {job.title}
                    </h3>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${typeBadgeClass(job.type)}`}>
                      {job.isRemote ? "Remote" : job.type}
                    </span>
                    {job.postedAt && (
                      <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(job.postedAt)}</span>
                    )}
                  </div>

                  {/* Company & location */}
                  <p className="text-sm font-medium text-blue-400 mb-1">
                    {job.company}
                    <span className="text-[var(--text-muted)] font-normal"> · {job.location}</span>
                  </p>

                  {/* Salary */}
                  <p className="text-xs font-semibold text-emerald-400 mb-2">{job.salary}</p>

                  {/* Description */}
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{job.description}</p>

                  {/* Tags + Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {job.tags.length > 0
                        ? job.tags.map((tag, i) => (
                            <span key={i} className="rounded bg-[var(--bg-muted)] border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                              {tag}
                            </span>
                          ))
                        : null}
                    </div>

                    <div className="flex gap-2 shrink-0 items-center">
                      {/* Apply */}
                      <a
                        href={getApplyUrl(job)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm inline-flex items-center"
                      >
                        Apply
                      </a>
                      {/* ATS Score */}
                      <button
                        onClick={() =>
                          router.push(`/ats?job_title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`)}
                        className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition">
                        Match ATS →
                      </button>
                      {/* Track */}
                      <button onClick={() => router.push("/applications")}
                        className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition">
                        Track
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* No results (after load) */}
          {!loading && !noKey && jobs.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-semibold text-[var(--text-primary)] mb-1">No jobs found</p>
              <p className="text-sm text-[var(--text-muted)]">Try different keywords or broaden your filters.</p>
            </div>
          )}

          {/* Bottom loading (load more) */}
          {loading && jobs.length > 0 &&
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`more-${i}`} />)}

          {/* Load more */}
          {!loading && !noKey && hasMore && jobs.length > 0 && (
            <div className="text-center pt-2">
              <button onClick={loadMore}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:border-blue-500/50 hover:bg-[var(--bg-muted)] transition">
                Load more jobs
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
