import styles from './LoadingSpinner.module.scss';

export function LoadingSpinner({ text }: { text: string }) {
  return (
    <div className={styles['nhsuk-loader']}>
      <span className={styles['nhsuk-loader__spinner']} />
      <span className={styles['nhsuk-loader__text']}>{text}</span>
    </div>
  );
}
