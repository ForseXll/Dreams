import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import StyledRegistry from './styled-registry';

export const metadata: Metadata = {
  title: 'Dreams',
  description: 'Dreams storefront frontend',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StyledRegistry>
          <Providers>{children}</Providers>
        </StyledRegistry>
      </body>
    </html>
  );
}
