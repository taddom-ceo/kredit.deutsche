import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/language-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kredit.deutsche",
  description: "Dein Kredit. Fair. Transparent. Digital.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var W=1440,M=1024,d=document.documentElement;d.classList.add("js");function fit(){var w=d.clientWidth;if(w<M){d.style.setProperty("--stage-width","100%");d.style.setProperty("--stage-zoom","1");d.style.setProperty("--stage-min-height","100vh");return;}var z=Math.min(1,w/W);d.style.setProperty("--stage-width",W+"px");d.style.setProperty("--stage-zoom",String(z));d.style.setProperty("--stage-min-height",Math.ceil(d.clientHeight/z)+"px");}fit();addEventListener("resize",fit);})();`,
          }}
        />
      </head>
      <body className="min-h-full">
        <div id="stage" className="flex flex-col">
          <LanguageProvider>{children}</LanguageProvider>
        </div>
      </body>
    </html>
  );
}
