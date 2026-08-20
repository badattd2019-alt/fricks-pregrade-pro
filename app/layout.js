import "./globals.css";

export const metadata = {
  title: "Fricks Pre-Grade Pro",
  description: "AI Card Scanner and Verified Marketplace",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}// forcing update for env variables