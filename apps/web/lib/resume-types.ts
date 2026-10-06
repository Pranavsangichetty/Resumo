export type PersonalDetails = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  grade: string;
};

export type Project = {
  id: string;
  name: string;
  technologies: string;
  link: string;
  description: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string;
};

export type Course = {
  id: string;
  name: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
};

export type ResumeData = {
  personal: PersonalDetails;

  summary: string;

  experiences: Experience[];

  education: Education[];

  skills: string[];

  projects: Project[];

  certifications: Certification[];

  courses?: Course[];
};

export const emptyResumeData: ResumeData = {
  personal: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },

  summary: "",

  experiences: [],

  education: [],

  skills: [],

  projects: [],

  certifications: [],

  courses: [],
};