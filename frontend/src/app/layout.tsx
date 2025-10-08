import type { Metadata } from 'next';
import '@/styles/app.scss';
import content from '@/content/content';
import ClientLayout from '@/components/molecules/ClientLayout/ClientLayout';
import { getConstants } from '@/utils/public-constants';

const { BASE_PATH } = getConstants();

export const dynamic = 'force-dynamic';

// https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-object
export const metadata: Metadata = {
  title: content.global.mainLayout.title,
  description: content.global.mainLayout.description,
  icons: {
    icon: {
      url: `${BASE_PATH}/lib/assets/favicons/favicon-192x192.png`,
      sizes: '192x192',
    },
    shortcut: {
      url: `${BASE_PATH}/lib/assets/favicons/favicon.ico`,
      type: 'image/x-icon',
    },
    apple: {
      url: `${BASE_PATH}/lib/assets/favicons/apple-touch-icon-180x180.png`,
    },
    other: [
      {
        rel: 'mask-icon',
        url: `${BASE_PATH}/lib/assets/favicons/favicon.svg`,
        color: '#005eb8',
      },
    ],
  },
  other: {
    'msapplication-TileImage': `${BASE_PATH}/lib/assets/favicons/mediumtile-144x144.png`,
    'msapplication-TileColor': '#005eb8',
    'msapplication-square70x70logo': `${BASE_PATH}/lib/assets/favicons/smalltile-70x70.png`,
    'msapplication-square150x150logo': `${BASE_PATH}/lib/assets/favicons/mediumtile-150x150.png`,
    'msapplication-wide310x150logo': `${BASE_PATH}/lib/assets/favicons/widetile-310x150.png`,
    'msapplication-square310x310logo': `${BASE_PATH}/lib/assets/favicons/largetile-310x310.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <title />
        <script src={`${BASE_PATH}/lib/nhsuk-9.1.0.min.js`} defer />
        <script src={`${BASE_PATH}/lib/cleanup.js`} defer />
      </head>
      <body suppressHydrationWarning>
        <script src={`${BASE_PATH}/lib/nhs-frontend-js-check.js`} defer />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
