import { Container } from '../components/Container'
import { Stack } from '../components/Stack'

export default async function Home() {
  return (
    <>
      <Container as='div' className="mt-12">
        <div className="flex flex-col items-center w-full">
          <Stack />
        </div>
      </Container>
    </>
  )
}
