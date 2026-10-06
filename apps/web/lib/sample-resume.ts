import { ResumeData } from "./resume-types";

export const SAMPLE_RESUME_TITLE = "Alex Morgan - Senior Full Stack Engineer (Sample)";

export const SAMPLE_RESUME_DATA: ResumeData = {
  personal: {
    fullName: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 349-2810",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/alexmorgan-dev",
    github: "https://github.com/alexmorgan",
    portfolio: "https://alexmorgan.dev",
  },
  summary:
    "Results-driven Senior Full Stack Engineer with 6+ years of experience designing, architecting, and scaling high-performance web applications and distributed cloud systems. Proven expertise in optimizing API latencies by 42%, spearheading system redesigns serving 2M+ active users, and implementing robust CI/CD pipelines. Strong advocate for clean architecture, automated testing, and ATS-friendly data-driven engineering practices.",
  skills: [
    "TypeScript",
    "JavaScript (ES6+)",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "Redis",
    "MongoDB",
    "Docker",
    "Kubernetes",
    "AWS (S3, Lambda, ECS)",
    "GraphQL",
    "RESTful APIs",
    "Tailwind CSS",
    "CI/CD Pipelines",
    "Microservices",
    "System Design",
    "Agile / Scrum",
  ],
  experiences: [
    {
      id: "exp-sample-1",
      role: "Senior Full Stack Software Engineer",
      company: "TechNova Cloud Solutions",
      location: "San Francisco, CA",
      startDate: "2022-03",
      endDate: "",
      current: true,
      description:
        "• Architected and scaled microservices handling 2.5M+ daily requests using Next.js, Node.js, and AWS Lambda, improving throughput by 35%.\n• Optimized PostgreSQL query performance and added Redis distributed caching, reducing p99 response times from 420ms to 68ms (42% latency reduction).\n• Spearheaded the engineering migration from legacy monolith to serverless architecture, slashing cloud infrastructure costs by $18,000/month.\n• Mentored a squad of 7 engineers, established automated code quality gates with Jest/Playwright, and reduced pull-request review cycles by 40%.",
    },
    {
      id: "exp-sample-2",
      role: "Software Engineer",
      company: "Apex Digital Systems",
      location: "Austin, TX",
      startDate: "2019-06",
      endDate: "2022-02",
      current: false,
      description:
        "• Developed responsive, accessible web interfaces using React, TypeScript, and modern CSS, improving user conversion rates by 28%.\n• Built and integrated 15+ REST and GraphQL API services interfacing with PostgreSQL and third-party payment gateways (Stripe).\n• Automated test suites using Jest and Cypress, driving test coverage from 55% to 92% and cutting production regression bugs by 60%.\n• Partnered closely with Product and UX teams in bi-weekly Agile sprints to deliver 8 major enterprise product launches on schedule.",
    },
    {
      id: "exp-sample-3",
      role: "Junior Web Developer",
      company: "Beacon Media Labs",
      location: "San Jose, CA",
      startDate: "2018-01",
      endDate: "2019-05",
      current: false,
      description:
        "• Created custom dynamic web applications and landing pages for client campaigns with 99.9% uptime.\n• Implemented client-side performance optimizations, accelerating Core Web Vitals and page load speeds by 1.8 seconds.\n• Collaborated on database schema migrations and assisted with automated Docker containerized staging deployments.",
    },
  ],
  education: [
    {
      id: "edu-sample-1",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      location: "Berkeley, CA",
      startDate: "2014-08",
      endDate: "2018-05",
      grade: "3.85 GPA · Magna Cum Laude",
    },
  ],
  projects: [
    {
      id: "proj-sample-1",
      name: "CloudScale Analytics Engine",
      technologies: "Next.js, TypeScript, FastAPI, PostgreSQL, Redis, Docker",
      link: "https://github.com/alexmorgan/cloudscale-analytics",
      description:
        "Engineered an open-source real-time event analytics platform processing up to 50,000 events/sec with sub-second dashboard rendering and automated anomaly alerts.",
    },
    {
      id: "proj-sample-2",
      name: "DevPulse - Team Workflow Suite",
      technologies: "React, Node.js, WebSockets, Tailwind CSS",
      link: "https://devpulse.io",
      description:
        "Built a collaborative developer workspace featuring real-time code snippet sharing, interactive API testing, and automated team performance metrics.",
    },
  ],
  certifications: [
    {
      id: "cert-sample-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services (AWS)",
      issueDate: "2023-04",
      credentialUrl: "https://aws.amazon.com/verification",
    },
    {
      id: "cert-sample-2",
      name: "Professional Scrum Master I (PSM I)",
      issuer: "Scrum.org",
      issueDate: "2022-09",
      credentialUrl: "https://scrum.org/certificates",
    },
  ],
};
