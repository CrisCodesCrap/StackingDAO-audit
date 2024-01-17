import { Container } from '../components/Container'
import { Stack } from '../components/Stack'
import { PoX } from '../components/PoX'
import { Stats } from '../components/Stats'

export default async function Home() {
  return (
    <>
      <Container as='div' className="mt-12">
        <div className="w-full flex flex-col items-center">
          <Stack />
          <div className="hidden lg:block">
            <Stats />
            <PoX />
          </div>
        </div>
      </Container>
    </>
  )
}
