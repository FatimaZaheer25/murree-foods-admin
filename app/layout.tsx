import type { Metadata } from "next";
import { AuthProvider } from "@murree/shared/components/auth/AuthContext";
import { themeScript } from "@murree/shared/components/ui/theme";
import { fontVariables } from "@murree/shared/styles/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin — MurreeFoods.com",
  robots: { index: false, follow: false }, // admin pages Google mein na aayen
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: theme script <html> par "dark" class laga deti hai, React is farq par shikayat na kare
    <html lang="en" suppressHydrationWarning className={`${fontVariables} h-full antialiased`}>
      <head>
        {/* Page rangne se pehle sahi theme (warna dark user ko pehle safed jhalak dikhti) */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
