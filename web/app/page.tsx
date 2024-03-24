import { Container } from '@/app/components/Container';
import { Stacking } from '@/app/components/Stacking';
import { Positions } from '@/app/components/Positions/Positions';
import { PoX } from '@/app/components/PoX';
import { Stats } from '@/app/components/Stats';

export default async function Home() {
  return (
    <>
      <Container as="div" className="mt-12">
        <div className="w-full min-h-full h-full flex flex-col items-center">
          <Stacking />

          <Positions />

          <Stats />
          <PoX />
        </div>
      </Container>
    </>
  );
}
