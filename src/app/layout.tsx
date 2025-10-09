import './globals.css';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><div className="p-4">{children}</div></body>
    </html>
  );
}
