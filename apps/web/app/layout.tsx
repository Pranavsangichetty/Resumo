import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Chatbot } from "@/components/chatbot";
import AppShell from "@/components/AppShell";

export const metadata = {
  metadataBase: new URL("https://resumo-zeta.vercel.app"),
  title: "Resumo",
  description: "Craft Better. Apply Smarter.",
  openGraph: {
    title: "Resumo - Build Your Dream Career",
    description: "Create standout resumes, track applications, prepare for interviews and get job-ready with AI.",
    images: ["/thumbnail.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resumo - Build Your Dream Career",
    description: "Create standout resumes, track applications, prepare for interviews and get job-ready with AI.",
    images: ["/thumbnail.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
