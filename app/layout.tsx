import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zen Fantasy IPL',
  description: 'Simple private fantasy IPL app for small groups.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
