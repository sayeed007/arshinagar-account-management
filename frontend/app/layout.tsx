import './globals.css';

export const metadata = {
  title: 'Arshinagar Account Management',
  description: 'Complete real estate and financial management system for Arshinagar',
};

// Root layout - Required by Next.js
// Must have <html> and <body> tags
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
