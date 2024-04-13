import { Container } from '@/app/components/Container';
import { Stack } from '@/app/components/Stack/Stack';
import { Stats } from '@/app/components/Stats';
import { PoX } from '@/app/components/PoX';

export default async function StackPage() {
  return (
    <>
      <Container as="div" className="mt-12 flex flex-col items-center w-full">
        <div className="grid grid-cols-1 gap-9 lg:grid-cols-2">
          <Stack />
          <div className="p-12 bg-dark-green-600 rounded-xl shadow-[0px_10px_10px_-5px_#00000003,0px_20px_25px_-5px_#0000000A]">
            <div className="flex flex-col">
              <Stats />
              <PoX />
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
