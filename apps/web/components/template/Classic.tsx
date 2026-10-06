import ResumePreview from "@/components/resume-preview/ResumePreview";
import { ResumeData } from "@/lib/resume-types";

interface Props {
  data: ResumeData;
}

export default function Classic({ data }: Props) {
  return <ResumePreview data={data} />;
}