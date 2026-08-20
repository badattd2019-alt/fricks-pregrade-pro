import './globals.css';

export const metadata = {
  title: 'Fricks Pre-Grade Pro',
  description: 'AI Card Scanner and Verified Marketplace',
  manifest: '/pwa-manifest.json',
  themeColor: '#06b6d4',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
