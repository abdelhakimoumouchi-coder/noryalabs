import { permanentRedirect } from 'next/navigation'

export default function MontresFemmeRedirect() {
  permanentRedirect('/shop?gender=femme')
}
