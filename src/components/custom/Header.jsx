import React from 'react'
import { Button } from '../ui/button'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate();

  return (
    <div className='p-3 shadow-sm flex justify-between items-center px-5'>
      <img src='/logo.svg' alt='logo' className='cursor-pointer' onClick={() => navigate('/')} />
      
      <div className='flex gap-3 items-center'>
        <SignedOut>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </SignedOut>
        
        <SignedIn>
          <Button variant="outline" onClick={() => navigate('/my-trips')}>
            My Trips
          </Button>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </div>
  )
}

export default Header
