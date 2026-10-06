import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Chatbot } from "@/components/chatbot";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Resumo",
  description: "Craft Better. Apply Smarter.",
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
