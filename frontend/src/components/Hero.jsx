import React from 'react'

const Hero = ({title, subtitle}) => {
  return (
    <>
    <section className="relative overflow-hidden" style={{backgroundColor: '#8b96ff', minHeight: 'calc(100vh - 80px)'}}>
      {/* Decorative Travel Icons */}
      <div className="absolute inset-0">
        {/* Airplane Path 1 - Top curved path */}
        <svg className="absolute top-8 left-0 w-full h-64 hidden md:block" style={{zIndex: 0}}>
          <path 
            d="M 50 80 Q 200 20, 400 100 T 800 80" 
            stroke="rgba(0,0,0,0.3)" 
            strokeWidth="3" 
            strokeDasharray="10,10" 
            fill="none"
          />
        </svg>

        {/* Airplane Path 2 - Bottom curved path */}
        <svg className="absolute bottom-32 left-0 w-full h-48 hidden lg:block" style={{zIndex: 0}}>
          <path 
            d="M 100 40 Q 300 100, 600 30 T 1000 60" 
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="3" 
            strokeDasharray="10,10" 
            fill="none"
          />
        </svg>

        {/* Top Left - Airplane */}
        <div className="absolute top-8 left-8 bg-yellow-300 border-4 border-black rounded-full p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-12 hidden sm:block" style={{zIndex: 1}}>
          <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        </div>

        {/* Top Right - Camera */}
        <div className="absolute top-20 right-24 bg-pink-300 border-4 border-black rounded-lg p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-6 hidden lg:block">
          <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Middle Left - Map Pin */}
        <div className="absolute top-1/2 left-12 bg-green-300 border-4 border-black rounded-full p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-6 hidden md:block">
          <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Bottom Left - Suitcase */}
        <div className="absolute bottom-32 left-20 bg-orange-300 border-4 border-black rounded-lg p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-12 hidden lg:block">
          <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5a1 1 0 100 2h4a1 1 0 100-2H8zM2 9a1 1 0 011-1h14a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V9z"></path>
          </svg>
        </div>

        {/* Middle Right - Compass */}
        <div className="absolute top-1/3 right-16 bg-blue-300 border-4 border-black rounded-full p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-45 hidden xl:block">
          <svg className="w-8 h-8 text-black -rotate-45" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Bottom Right - Passport */}
        <div className="absolute bottom-40 right-32 bg-purple-300 border-4 border-black rounded-lg p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-3 hidden md:block">
          <svg className="w-9 h-9 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Polaroid Photo - Below Subtitle */}
        <div className="absolute top-[45%] left-[20%] bg-white border-4 border-black rounded shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-6 hidden lg:block" style={{width: '120px', paddingBottom: '8px'}}>
          <div className="bg-gradient-to-br from-cyan-300 to-blue-400 border-b-4 border-black" style={{height: '90px'}}>
            <svg className="w-full h-full p-6 text-black opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div className="h-8"></div>
        </div>

        {/* Polaroid Photo 2 - Right side near compass */}
        <div className="absolute top-[40%] right-[15%] bg-white border-4 border-black rounded shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-12 hidden xl:block" style={{width: '100px', paddingBottom: '8px'}}>
          <div className="bg-gradient-to-br from-pink-300 to-orange-300 border-b-4 border-black" style={{height: '75px'}}>
            <svg className="w-full h-full p-5 text-black opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div className="h-6"></div>
        </div>

        {/* Mobile-only icons - simpler, smaller layout */}
        {/* Top Left Mobile - Airplane */}
        <div className="absolute top-4 left-4 bg-yellow-300 border-3 border-black rounded-full p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-12 sm:hidden">
          <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        </div>

        {/* Top Right Mobile - Camera */}
        <div className="absolute top-4 right-4 bg-pink-300 border-3 border-black rounded-lg p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-6 sm:hidden">
          <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Bottom Mobile - Map Pin */}
        <div className="absolute bottom-16 left-6 bg-green-300 border-3 border-black rounded-full p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-6 sm:hidden">
          <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{transform: 'translateY(-25%)'}}
      >
        <div className="text-center">
          <h1
            className="text-4xl font-extrabold text-black sm:text-5xl md:text-6xl lg:text-7xl uppercase"
          >
            {title}
          </h1>
          <p className="my-4 sm:my-5 text-lg sm:text-xl md:text-2xl text-black">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
    </>
  )
}

export default Hero