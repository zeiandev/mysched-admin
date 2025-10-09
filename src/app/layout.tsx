import './globals.css';
import Nav from '@/components/Nav';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <div className="p-4">{children}</div>
      </body>
    </html>
  );
}
