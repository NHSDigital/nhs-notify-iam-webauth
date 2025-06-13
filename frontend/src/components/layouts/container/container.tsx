export default function NHSNotifyContainer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='nhsuk-width-container'>
      <main className='nhsuk-main-wrapper' role='main'>
        {children}
      </main>
    </div>
  );
}
