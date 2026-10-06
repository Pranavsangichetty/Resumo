import { ResumeData } from "./resume-types";

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