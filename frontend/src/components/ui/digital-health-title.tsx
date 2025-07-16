"use client"

import { useState, useEffect, useRef } from "react"

const DigitalHealthTitle = () => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [scrolled, setScrolled] = useState(false)
  const floatingElementsRef = useRef<HTMLElement[]>([])

  useEffect(() => {
    const animateWords = () => {
      const wordElements = document.querySelectorAll(".word-animate")
      wordElements.forEach((word) => {
        const delay = Number.parseInt(word.getAttribute("data-delay") || "0") || 0
        setTimeout(() => {
          if (word instanceof HTMLElement) word.style.animation = "word-appear 0.8s ease-out forwards"
        }, delay)
      })
    }
    const timeoutId = setTimeout(animateWords, 500)
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY }
      setRipples((prev) => [...prev, newRipple])
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== newRipple.id)), 1000)
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  useEffect(() => {
    const wordElements = document.querySelectorAll(".word-animate")
    const handleMouseEnter = (e: Event) => {
      if (e.target instanceof HTMLElement) e.target.style.textShadow = "0 0 20px rgba(59, 130, 246, 0.5)"
    }
    const handleMouseLeave = (e: Event) => {
      if (e.target instanceof HTMLElement) e.target.style.textShadow = "none"
    }
    wordElements.forEach((word) => {
      word.addEventListener("mouseenter", handleMouseEnter)
      word.addEventListener("mouseleave", handleMouseLeave)
    })
    return () => {
      wordElements.forEach((word) => {
        if (word) {
          word.removeEventListener("mouseenter", handleMouseEnter)
          word.removeEventListener("mouseleave", handleMouseLeave)
        }
      })
    }
  }, [])

  const pageStyles = `
    @keyframes word-appear { 
      0% { opacity: 0; transform: translateY(30px) scale(0.8); filter: blur(10px); } 
      50% { opacity: 0.8; transform: translateY(10px) scale(0.95); filter: blur(2px); } 
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 
    }
    .word-animate { 
      display: inline-block; 
      opacity: 0; 
      margin: 0 0.1em; 
      transition: color 0.3s ease, transform 0.3s ease; 
    }
    .word-animate:hover { 
      color: #60a5fa; 
      transform: translateY(-2px); 
    }
    .text-decoration-animate { 
      position: relative; 
    }
    .text-decoration-animate::after { 
      content: ''; 
      position: absolute; 
      bottom: -4px; 
      left: 0; 
      width: 0; 
      height: 1px; 
      background: linear-gradient(90deg, transparent, #60a5fa, transparent); 
      animation: underline-grow 2s ease-out forwards; 
      animation-delay: 2s; 
    }
    @keyframes underline-grow { 
      to { width: 100%; } 
    }
    .floating-element-animate { 
      position: absolute; 
      width: 4px; 
      height: 4px; 
      background: #60a5fa; 
      border-radius: 50%; 
      opacity: 0.6; 
      animation: float 4s ease-in-out infinite; 
    }
    @keyframes float { 
      0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; } 
      25% { transform: translateY(-10px) translateX(5px); opacity: 0.8; } 
      50% { transform: translateY(-5px) translateX(-3px); opacity: 0.5; } 
      75% { transform: translateY(-15px) translateX(7px); opacity: 0.9; } 
    }
    .ripple-effect { 
      position: fixed; 
      width: 4px; 
      height: 4px; 
      background: rgba(59, 130, 246, 0.6); 
      border-radius: 50%; 
      transform: translate(-50%, -50%); 
      pointer-events: none; 
      animation: pulse-glow 1s ease-out forwards; 
      z-index: 9999; 
    }
    @keyframes pulse-glow { 
      0% { opacity: 0.6; transform: scale(1); } 
      50% { opacity: 1; transform: scale(3); } 
      100% { opacity: 0; transform: scale(6); } 
    }
  `

  return (
    <>
      <style>{pageStyles}</style>
      <div className="relative">
        <div className="floating-element-animate" style={{ top: "25%", left: "15%", animationDelay: "0.5s" }}></div>
        <div className="floating-element-animate" style={{ top: "60%", left: "85%", animationDelay: "1s" }}></div>
        <div className="floating-element-animate" style={{ top: "40%", left: "10%", animationDelay: "1.5s" }}></div>
        <div className="floating-element-animate" style={{ top: "70%", left: "25%", animationDelay: "2s" }}></div>
        <div className="floating-element-animate" style={{ top: "30%", left: "75%", animationDelay: "2.5s" }}></div>

        <div className="relative z-10 text-center py-8">
          <h2 className="text-xs sm:text-sm font-mono font-light text-blue-300 uppercase tracking-[0.2em] opacity-80 mb-4">
            <span className="word-animate" data-delay="0">
              Saúde
            </span>
            <span className="word-animate" data-delay="300">
              Digital
            </span>
          </h2>

          <h1 className="text-4xl md:text-5xl font-extralight leading-tight tracking-tight text-white text-decoration-animate">
            <div className="mb-4">
              <span className="word-animate" data-delay="700">
                Bem-vindo
              </span>
              <span className="word-animate" data-delay="850">
                ao
              </span>
              <span className="word-animate" data-delay="1000">
                HEALTH
              </span>
              <span className="word-animate" data-delay="1150">
                🧘‍♂️
              </span>
            </div>
          </h1>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-6">
            <span className="word-animate" data-delay="1400">
              Descubra
            </span>
            <span className="word-animate" data-delay="1550">
              mais
            </span>
            <span className="word-animate" data-delay="1700">
              sobre
            </span>
            <span className="word-animate" data-delay="1850">
              sua
            </span>
            <span className="word-animate" data-delay="2000">
              saúde
            </span>
            <span className="word-animate" data-delay="2150">
              e
            </span>
            <span className="word-animate" data-delay="2300">
              bem-estar
            </span>
            <span className="word-animate" data-delay="2450">
              através
            </span>
            <span className="word-animate" data-delay="2600">
              de
            </span>
            <span className="word-animate" data-delay="2750">
              questionários
            </span>
            <span className="word-animate" data-delay="2900">
              especializados
            </span>
          </p>
        </div>

        {ripples.map((ripple) => (
          <div key={ripple.id} className="ripple-effect" style={{ left: `${ripple.x}px`, top: `${ripple.y}px` }}></div>
        ))}
      </div>
    </>
  )
}

export default DigitalHealthTitle
