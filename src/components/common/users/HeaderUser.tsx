'use client'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import HeaderUserMobile from './HeaderUserMobile'
import HeaderPC from './HeaderPc'

export default function HeaderUser(props: { onMenuClick?: () => void }) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return isMobile
    ? <HeaderUserMobile  />
    : <HeaderPC   />
}
