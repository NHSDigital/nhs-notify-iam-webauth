import styles from './LoadingSpinner.module.scss';

export function LoadingSpinner({ text }: { text: string }) {
  return (
    <div className={styles['nhsuk-loader']}>
      <span className={styles['nhsuk-loader__spinner']} />
      <h1 className={styles['nhsuk-loader__text']}>{text}</h1>
    </div>
  );
}
