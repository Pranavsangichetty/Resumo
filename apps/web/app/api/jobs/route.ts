import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? "";
const KEY_MISSING =
  !RAPIDAPI_KEY ||
  RAPIDAPI_KEY === "your_rapidapi_key_here" ||
  RAPIDAPI_KEY.startsWith("your_");

const JSEARCH_HOST = "jsearch.p.rapidapi.com";
const JSEARCH_BASE = `https://${JSEARCH_HOST}/search`;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const query        = searchParams.get("query")    || "jobs in India";
  const page         = searchParams.get("page")     || "1";
  const jobType      = searchParams.get("jobType")  || "";
  const datePosted   = searchParams.get("datePosted") || "all";
  const remoteOnly   = searchParams.get("remoteOnly") || "false";

  if (KEY_MISSING) {
    return NextResponse.json(
      { error: "RAPIDAPI_KEY not configured", jobs: [] },
      { status: 200 }
    );
  }

  const params = new URLSearchParams({
    query,
    page,
    num_pages: "1",
    date_posted: datePosted,
    remote_jobs_only: remoteOnly,
    ...(jobType ? { employment_types: jobType } : {}),
  });

  try {
    const res = await fetch(`${JSEARCH_BASE}?${params.toString()}`, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": JSEARCH_HOST,
      },
      // Cache for 10 minutes so we don't blow the free-tier quota
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[jobs/route] JSearch error", res.status, text);
      return NextResponse.json({ error: "Upstream API error", jobs: [] }, { status: 200 });
    }

    const data = await res.json();

    // Normalise the JSearch shape into something clean for the UI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobs = (data.data ?? []).map((j: any) => ({
      id:           j.job_id,
      title:        j.job_title,
      company:      j.employer_name,
      companyLogo:  j.employer_logo ?? null,
      location:
        [j.job_city, j.job_state, j.job_country]
          .filter(Boolean)
          .join(", ") || "India",
      isRemote:     j.job_is_remote ?? false,
      type:         normaliseType(j.job_employment_type),
      salary:       formatSalary(j),
      description:  j.job_description
        ? j.job_description.slice(0, 220).trim() + "…"
        : "No description available.",
      tags:         (j.job_required_skills ?? []).slice(0, 6),
      applyUrl:     j.job_apply_link ?? "#",
      postedAt:     j.job_posted_at_datetime_utc ?? null,
      source:       j.job_publisher ?? "Job Board",
    }));

    return NextResponse.json({ jobs, total: data.status === "OK" ? jobs.length : 0 });
  } catch (err) {
    console.error("[jobs/route] fetch failed", err);
    return NextResponse.json({ error: "Network error", jobs: [] }, { status: 200 });
  }
}

function normaliseType(raw: string | null | undefined): string {
  switch ((raw ?? "").toUpperCase()) {
    case "FULLTIME":   return "Full-Time";
    case "PARTTIME":   return "Part-Time";
    case "CONTRACTOR":
    case "CONTRACT":   return "Contract";
    case "INTERN":
    case "INTERNSHIP": return "Internship";
    default:           return "Full-Time";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatSalary(j: any): string {
  const min = j.job_min_salary;
  const max = j.job_max_salary;
  const period = j.job_salary_period;
  const currency = j.job_salary_currency ?? "INR";

  if (!min && !max) return "Salary not disclosed";

  const fmt = (n: number) =>
    currency === "INR"
      ? `₹${(n / 100000).toFixed(1)}L`
      : `$${Math.round(n / 1000)}k`;

  const suffix = period ? ` / ${period.toLowerCase()}` : "";

  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`;
  if (min)        return `From ${fmt(min)}${suffix}`;
  return `Up to ${fmt(max!)}${suffix}`;
}
