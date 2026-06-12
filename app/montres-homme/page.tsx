import { permanentRedirect } from 'next/navigation'

export default function MontresHommeRedirect() {
  permanentRedirect('/shop?gender=homme')
}
