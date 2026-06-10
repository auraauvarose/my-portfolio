import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "auraauvarose",
  description: "A showcase of my skills and projects as a software developer.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Blocking script: apply saved theme BEFORE first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var tc = localStorage.getItem('theme_color');
              var dt = localStorage.getItem('default_theme');
              var bg = localStorage.getItem('bg_theme');
              if (tc) {
                document.documentElement.style.setProperty('--accent-color', tc);
                if (tc.startsWith('#') && tc.length === 7) {
                  var r = parseInt(tc.substring(1, 3), 16);
                  var g = parseInt(tc.substring(3, 5), 16);
                  var b = parseInt(tc.substring(5, 7), 16);
                  document.documentElement.style.setProperty('--accent-color-rgb', r + ', ' + g + ', ' + b);
                }
              }
              if (dt === 'light') {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}