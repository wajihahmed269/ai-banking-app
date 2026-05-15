export default function ScrollFloat({
  as: Element = 'h1',
  children,
  className = '',
  ...props
}) {
  const text = String(children || '');
  const words = text.split(' ');

  return (
    <Element className={`scroll-float ${className}`.trim()} {...props}>
      {words.map((word, index) => (
        <span
          className="scroll-float-word"
          style={{ '--float-index': index }}
          key={`${word}-${index}`}
        >
          {word}
          {index < words.length - 1 ? '\u00a0' : ''}
        </span>
      ))}
    </Element>
  );
}
