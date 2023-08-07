import Image from 'next/image'
import { Container } from './components/Container'
import { Stacking } from './components/Stacking'
import { PoX } from './components/PoX'

export default async function Home() {
  return (
    <>
      <Container className="mt-12">
        <div className="w-full min-h-full h-full flex flex-col items-center">
          <Stacking />
          <PoX />
        </div>
      </Container>
    </>
  )
}
