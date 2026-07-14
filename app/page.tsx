import { parseDsaWorkbook } from './utils/dsaParser';
import TrackerClient from './TrackerClient';

export default function Home() {
  const topics = parseDsaWorkbook();

  return (
    <main className="min-h-screen flex flex-col">
      <TrackerClient topics={topics} />
    </main>
  );
}
