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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('PWA Service Worker registered:', reg.scope); })
                    .catch(function(err) { console.log('PWA SW registration failed:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
