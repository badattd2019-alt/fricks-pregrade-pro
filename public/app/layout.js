import './globals.css';

export const metadata = {
  title: 'Fricks Pre-Grade Pro',
  description: 'AI Sports & TCG Card Grading Inspector & Marketplace',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#020617" />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch((err) => console.log('SW registration error:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
