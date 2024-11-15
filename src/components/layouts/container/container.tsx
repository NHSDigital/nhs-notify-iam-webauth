export function NHSNotifyContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='nhsuk-width-container'>
      <main className='nhsuk-main-wrapper nhsuk-u-padding-top-4' role='main'>
        {process.env.NEXT_PUBLIC_DISABLE_CONTENT === 'true' ? (
          <h1>Coming soon</h1>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
