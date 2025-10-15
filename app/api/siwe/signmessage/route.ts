import { NextRequest, NextResponse } from 'next/server'
import { SiweMessage } from 'siwe'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'siwe-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export async function POST(req: NextRequest) {
  try {
    const { message, signature } = await req.json()
    
    console.log('=== SIWE Debug ===')
    console.log('Message type:', typeof message)
    console.log('Message:', message)
    console.log('Signature:', signature)
    
    // Parse the message - it might be a string or object
    let siweMessage: SiweMessage
    
    if (typeof message === 'string') {
      siweMessage = new SiweMessage(message)
    } else {
      // If it's an object, create SiweMessage from object
      siweMessage = new SiweMessage(message)
    }
    
    console.log('Parsed SIWE message:', siweMessage)
    
    // Verify the signature
    const verificationResult = await siweMessage.verify({ signature })
    
    console.log('Verification result:', verificationResult)
    
    if (verificationResult.success) {
      const cookieStore = await cookies()
      const session = await getIronSession(cookieStore, sessionOptions)
      
      session.address = siweMessage.address
      session.chainId = siweMessage.chainId
      await session.save()
      
      console.log('Session saved:', session)
      
      return NextResponse.json({ ok: true })
    }
    
    return NextResponse.json({ 
      ok: false, 
      error: 'Verification failed',
      details: verificationResult 
    }, { status: 401 })
    
  } catch (error) {
    console.error('=== SIWE Error ===')
    console.error('Error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}