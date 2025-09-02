"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ImageIcon, X, AlertTriangle, FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  value: FileList | null | undefined
  onChange: (files: FileList | null) => void
  maxSize?: number
  acceptedTypes?: string[]
}

export function FileUploader({
  value,
  onChange,
  maxSize = 50 * 1024 * 1024, // 50MB default
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"],
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Simulate upload progress
  const simulateUpload = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit.`)
      return false
    }

    if (!acceptedTypes.includes(file.type)) {
      setError("File type not supported.")
      return false
    }

    setError(null)
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        onChange(e.dataTransfer.files)
        simulateUpload()
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        onChange(e.target.files)
        simulateUpload()
      }
    }
  }

  const handleRemoveFile = () => {
    onChange(null)
    setUploadProgress(0)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const files = value ? Array.from(value) : []
  const hasFiles = files.length > 0

  return (
    <div className="w-full">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          hasFiles ? "bg-muted/50" : "",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {!hasFiles ? (
            <>
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <ImageIcon className="h-10 w-10" />
              </div>
              <p className="text-sm font-medium">
                Drop your files here or{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => inputRef.current?.click()}
                >
                  browse
                </Button>
              </p>
              <p className="text-xs text-muted-foreground">Maximum size: {maxSize / (1024 * 1024)}MB</p>
            </>
          ) : (
            <div className="w-full">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-muted p-1 rounded">
                      <FileIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleRemoveFile}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              ))}
              <div className="w-full mt-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-right mt-1 text-muted-foreground">{uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept={acceptedTypes.join(",")} />
    </div>
  )
}
