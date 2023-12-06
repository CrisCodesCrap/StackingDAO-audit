import { Container } from './components/Container'
import { Stacking } from './components/Stacking'
import { Positions } from './components/Positions'
import { PoX } from './components/PoX'

export default async function Home() {
  return (
    <>
      <Container as='div' className="mt-12">
        <div className="w-full min-h-full h-full flex flex-col items-center">
          <Stacking />

          <Positions />

          <PoX />
        </div>
      </Container>
    </>
  )
}
