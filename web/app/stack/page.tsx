import { Container } from '../components/Container'
import { Stack } from '../components/Stack'
import { PoX } from '../components/PoX'

export default async function Home() {
  return (
    <>
      <Container className="mt-12">
        <div className="w-full min-h-full h-full flex flex-col items-center">
          <Stack />
          <PoX />
        </div>
      </Container>
    </>
  )
}
