export async function NHSNotifyContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='nhsuk-width-container'>
      <main className='nhsuk-main-wrapper nhsuk-u-padding-top-4' role='main'>
        {children}
      </main>
    </div>
  );
}
