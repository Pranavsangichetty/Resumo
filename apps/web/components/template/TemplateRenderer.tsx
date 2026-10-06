import { ResumeData } from "@/lib/resume-types";
import {
  DEFAULT_TEMPLATE,
  ResumeTemplate,
} from "@/lib/template-types";

import ATSProfessional from "./ATSProfessional";
import Harvard from "./Harvard";
import Modern from "./Modern";
import Executive from "./Executive";
import Google from "./Google";
import Minimal from "./Minimal";
import Creative from "./Creative";
import Elegant from "./Elegant";
import Cloud from "./Cloud";

interface TemplateRendererProps {
  data: ResumeData;
  template?: ResumeTemplate;
}

export default function TemplateRenderer({
  data,
  template = DEFAULT_TEMPLATE,
}: TemplateRendererProps) {
  switch (template) {
    case "harvard":
      return <Harvard data={data} />;

    case "modern":
      return <Modern data={data} />;

    case "google":
      return <Google data={data} />;

    case "executive":
      return <Executive data={data} />;

    case "minimal":
      return <Minimal data={data} />;

    case "creative":
      return <Creative data={data} />;

    case "elegant":
      return <Elegant data={data} />;

    case "cloud":
      return <Cloud data={data} />;

    case "ats":
    default:
      return <ATSProfessional data={data} />;
  }
}