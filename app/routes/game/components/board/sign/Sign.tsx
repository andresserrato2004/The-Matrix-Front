type SignProps = {
  x: number;
  y: number;
  styles: any;
  sign: string;
};

export default function Sign({ x, y, styles, sign }: SignProps) {
    
  return (
    <div
      className="sign"
      style={styles}
    >
      <img src={`/signs/${sign}.webp`} alt={`${sign} sign`} />
    </div>
  );
}