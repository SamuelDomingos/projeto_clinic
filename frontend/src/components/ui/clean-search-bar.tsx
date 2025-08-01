"use client"

import type React from "react"
import { useState } from "react"
import { Search, X } from "lucide-react"

interface CleanSearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
}

const CleanSearchBar: React.FC<CleanSearchBarProps> = ({
  onSearch,
  placeholder = "Pesquisar questionários...",
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleClear = () => {
    setSearchQuery("")
    onSearch?.("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <div className={`relative w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative flex items-center bg-gray-800/60 backdrop-blur-sm border rounded-lg transition-all duration-300 ${
            isFocused
              ? "border-blue-500/50 shadow-lg shadow-blue-500/10 bg-gray-800/80"
              : "border-gray-600/40 hover:border-gray-500/60"
          }`}
        >
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />

          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 p-1 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700/50"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </form>

      {/* Dica de atalho */}
      {!isFocused && !searchQuery && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-500">
          <kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-xs border border-gray-600/30">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-xs border border-gray-600/30">K</kbd>
        </div>
      )}
    </div>
  )
}

export default CleanSearchBar