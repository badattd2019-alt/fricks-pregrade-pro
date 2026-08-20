import "./globals.css";

export const metadata = {
  title: "Fricks Pre-Grade Pro",
  description: "AI Card Scanner and Verified Marketplace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}