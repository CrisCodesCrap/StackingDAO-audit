import Image from 'next/image'
import { Container } from '../components/Container'
import { Unstack } from '../components/Unstack'
import { PoX } from '../components/PoX'
import { Stats } from '../components/Stats'

export default async function Home() {
  return (
    <>
      <Container as='div' className="mt-12">
        <div className="w-full min-h-full h-full flex flex-col items-center">
          <Unstack />
          <div className="hidden lg:block">
            <Stats />
            <PoX />
          </div>
        </div>
      </Container>
    </>
  )
}
