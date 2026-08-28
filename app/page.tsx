import { parseDsaWorkbook } from './utils/dsaParser';
import TrackerClient from './TrackerClient';

export default function Home() {
  const topics = parseDsaWorkbook();

  return <TrackerClient topics={topics} />;
}
