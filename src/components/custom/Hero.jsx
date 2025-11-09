import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'

function Hero() {
  return (
    <div className='flex flex-col items-center mx-56 gap-9'>
      <h1 className='font-light text-[50px] text-center mt-16'>Discover Your Next Adventure with <span className='text-[#f56551]'>Travel Buddy</span> A Personalized AI Trip Planner for a  perfect Places.</h1>
      <p className='text-xl text-gray-500 text-center'>Your trip planner and travel curator, creating custom itineraires tailored to your interest and budget.</p>


      <Link to={'/create-trip'} >
        <Button>let's Explore!</Button>
      </Link>

    </div>
  )
}

export default Hero