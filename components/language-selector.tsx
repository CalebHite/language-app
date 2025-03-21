"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface LanguageSelectorProps {
  targetLang: string
  changeLanguage: (lang: string) => void
  isUpdatingLang?: boolean
}

const languageOptions = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
]

export function LanguageSelector({ targetLang, changeLanguage, isUpdatingLang = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedLanguage = languageOptions.find((lang) => lang.code === targetLang) || languageOptions[0]

  const handleSelect = (code: string) => {
    changeLanguage(code)
    setIsOpen(false)
  }

  return (
    <div className="relative mb-2">
      <div className="flex items-center">
        <div className="relative">
          <button
            type="button"
            className={`flex items-center justify-between w-40 px-3 py-2 text-sm bg-white border rounded-md shadow-sm ${
              isUpdatingLang ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
            onClick={() => !isUpdatingLang && setIsOpen(!isOpen)}
            disabled={isUpdatingLang}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className="flex items-center">
              <span className="mr-2 text-lg" aria-hidden="true">
                {selectedLanguage.flag}
              </span>
              <span>{selectedLanguage.name}</span>
            </span>
            <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              <ul className="py-1" role="listbox" aria-labelledby="language-selector">
                {languageOptions.map((option) => (
                  <li
                    key={option.code}
                    className={`flex items-center px-3 py-2 text-sm cursor-pointer ${
                      option.code === targetLang ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                    }`}
                    role="option"
                    aria-selected={option.code === targetLang}
                    onClick={() => handleSelect(option.code)}
                  >
                    <span className="mr-2 text-lg">{option.flag}</span>
                    <span>{option.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

