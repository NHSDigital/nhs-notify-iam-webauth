import type { Metadata } from 'next';
import '@/src/styles/app.scss';
import content from '@/src/content/content';
import { ClientLayout } from '@/src/components/molecules/ClientLayout/ClientLayout';
import 'nhsuk-frontend/dist/nhsuk.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: content.global.mainLayout.title,
  description: content.global.mainLayout.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
