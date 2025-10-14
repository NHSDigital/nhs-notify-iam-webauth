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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <link
          rel='icon'
          href={`${BASE_PATH}/lib/assets/favicons/favicon.ico`}
          sizes='48x48'
        />
        <link
          rel='icon'
          href={`${BASE_PATH}/lib/assets/favicons/favicon.svg`}
          sizes='any'
          type='image/svg+xml'
        />
        <link
          rel='mask-icon'
          href={`${BASE_PATH}/lib/assets/favicons/favicon.svg`}
          color='#005eb8'
        />
        <link
          rel='apple-touch-icon'
          href={`${BASE_PATH}/lib/assets/favicons/apple-touch-icon-180x180.png`}
        />
        <script src={`${BASE_PATH}/lib/nhsuk-9.1.0.min.js`} defer />
      </head>
      <body suppressHydrationWarning>
        <script src={`${BASE_PATH}/lib/nhs-frontend-js-check.js`} defer />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
