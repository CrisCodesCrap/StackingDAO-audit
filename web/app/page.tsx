import { Container } from './components/Container';
import { Stacking } from './components/Stacking';
import { Positions } from './components/Positions/Positions';

export default async function Home() {
  return (
    <>
      <Container as="div" className="mt-12">
        <div className="flex flex-col items-center w-full h-full min-h-full">
          <Stacking />

          <Positions />
        </div>
      </Container>
    </>
  );
}
