import { Container } from '../components/Container'
import { Stake } from '../components/Stake'

export default function StackingDAO() {
  return (
    <Container className="mt-12">
      <div className="py-10">
        <div className="w-full text-center hidden md:block font-semibold text-4xl my-8">Stake for a Revenue Share</div>

        <Stake />
      </div>
    </Container>
  )
}
