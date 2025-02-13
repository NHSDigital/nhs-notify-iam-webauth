type Props = {
  title: string;
  description: string;
};

export const MetaTitle = ({ title, description }: Props) => (
  <>
    <title>{title}</title>
    <meta name='description' content={description} />
  </>
);
