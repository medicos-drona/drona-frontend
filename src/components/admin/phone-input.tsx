"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface CountryCode {
  id: string
  name: string
  code: string
  flag: string
}

// Restrict to India and format as per Indian mobile standards
const countryCodes: CountryCode[] = [
  {
    id: "in",
    name: "India",
    code: "+91",
    flag: "🇮🇳",
  },
]

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function PhoneInput({ value, onChange, className }: PhoneInputProps) {
  const [open, setOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0])

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Indian format: always use +91 prefix and group as 5-5 digits
    if (selectedCountry.id === "in") {
      let phoneDigits = digits
      // If user includes country code, drop it for normalization
      if (phoneDigits.startsWith("91")) {
        phoneDigits = phoneDigits.slice(2)
      }
      // Limit to 10 digits for Indian mobile numbers
      if (phoneDigits.length > 10) {
        phoneDigits = phoneDigits.slice(0, 10)
      }
      if (phoneDigits.length === 0) return ""
      if (phoneDigits.length <= 5) return `+91 ${phoneDigits}`
      return `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`
    }

    // Fallback: just return digits
    return digits
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    onChange(formatted)
  }

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country)
    setOpen(false)
    // Clear the phone number when changing country
    onChange("")
  }

  return (
    <div className={cn("flex", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[80px] justify-between px-2 border-r-0 rounded-r-none"
          >
            <span className="mr-1">{selectedCountry.flag}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup className="max-h-[200px] overflow-y-auto">
                {countryCodes.map((country) => (
                  <CommandItem key={country.id} value={country.name} onSelect={() => handleCountrySelect(country)}>
                    <span className="mr-2">{country.flag}</span>
                    <span>{country.name}</span>
                    <span className="ml-auto text-muted-foreground">{country.code}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        value={value}
        onChange={handlePhoneChange}
        className="rounded-l-none"
        placeholder={selectedCountry.id === "in" ? "+91 85535 77004" : "Phone number"}
      />
    </div>
  )
}
