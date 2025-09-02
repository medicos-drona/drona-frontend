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

const countryCodes: CountryCode[] = [
  {
    id: "us",
    name: "United States",
    code: "+1",
    flag: "🇺🇸",
  },
  {
    id: "ca",
    name: "Canada",
    code: "+1",
    flag: "🇨🇦",
  },
  {
    id: "gb",
    name: "United Kingdom",
    code: "+44",
    flag: "🇬🇧",
  },
  {
    id: "au",
    name: "Australia",
    code: "+61",
    flag: "🇦🇺",
  },
  // Add more countries as needed
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

    // Format as (XXX) XXX-XXXX for US/CA numbers
    if (selectedCountry.id === "us" || selectedCountry.id === "ca") {
      if (digits.length <= 3) {
        return digits
      } else if (digits.length <= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
      } else {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
      }
    }

    // For other countries, just return the digits
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
        placeholder={selectedCountry.id === "us" ? "(000) 000-0000" : "Phone number"}
      />
    </div>
  )
}
