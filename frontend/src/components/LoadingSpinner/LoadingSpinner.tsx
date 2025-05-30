import styles from '@/components/LoadingSpinner/LoadingSpinner.module.scss';

export default function LoadingSpinner({ text }: Readonly<{ text: string }>) {
  return (
    <div className={styles['nhsuk-loader']}>
      <span className={styles['nhsuk-loader__spinner']} />
      <h1 className={styles['nhsuk-loader__text']}>{text}</h1>
    </div>
  );
}
