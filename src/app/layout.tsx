import type { Metadata, Viewport } from "next";
import { Outfit, Cairo } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";
import InstallPrompt from "@/components/InstallPrompt";
import { Toaster } from 'sonner';
import LanguageProvider from "@/components/LanguageProvider";
import AuthProvider from "@/components/AuthProvider";

const outfit = Outfit({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "QuickHandy | Instant Handyman & Home Services",
  description: "On-demand booking for professional electricians, plumbers, carpenters, and technicians. Real-time tracking and trusted professionals at your doorstep.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QuickHandy Admin",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${outfit.variable} ${cairo.variable} dark font-cairo`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var lang = 'ar';
                  var stored = localStorage.getItem('language-storage');
                  if (stored) {
                    var parsed = JSON.parse(stored);
                    if (parsed && parsed.state && parsed.state.language) {
                      lang = parsed.state.language;
                    }
                  } else {
                    var m = document.cookie.match(/app_lang=(ar|en)/);
                    if (m) lang = m[1];
                  }
                  document.documentElement.lang = lang;
                  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
                  if (lang !== 'ar') {
                    document.documentElement.classList.remove('font-cairo');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased text-slate-100 min-h-screen selection:bg-brand-blue-500 selection:text-white">
        <PwaRegister />
        <AuthProvider>
          <LanguageProvider>
            {children}
            <InstallPrompt />
          </LanguageProvider>
        </AuthProvider>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
