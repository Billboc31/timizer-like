import './SectionHeading.css';

interface SectionHeadingProps {
  title: string;
  supportingText?: string;
}

export function SectionHeading({ title, supportingText }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <h2 className="section-heading__title">{title}</h2>
      {supportingText && <p className="section-heading__supporting-text">{supportingText}</p>}
    </div>
  );
}
