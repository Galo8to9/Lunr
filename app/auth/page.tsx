"use client"

import LoginCard from '@/components/auth/LoginCard'
import Footer from '@/components/Footer'
import NoiseLayer from '@/components/NoiseLayer'
import React from 'react'
import { WagmiProvider } from 'wagmi'

const page = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <LoginCard/>
    </div>
  )
}

export default page