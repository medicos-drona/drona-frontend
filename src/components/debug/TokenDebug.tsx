"use client"

import { useEffect, useState } from "react"

export function TokenDebug() {
  const [tokens, setTokens] = useState<Record<string, string | null>>({})

  useEffect(() => {
    // Check all possible token keys used in the codebase
    const tokenKeys = [
      'backendToken',
      'firebaseToken', 
      'token',
      'accessToken',
      'authToken'
    ]
    
    const tokenData: Record<string, string | null> = {}
    
    tokenKeys.forEach(key => {
      const token = localStorage.getItem(key)
      tokenData[key] = token ? `${token.substring(0, 30)}...` : null
    })
    
    setTokens(tokenData)
  }, [])

  const clearAllTokens = () => {
    Object.keys(tokens).forEach(key => {
      localStorage.removeItem(key)
    })
    setTokens({})
    alert("All tokens cleared!")
  }

  const refreshTokens = () => {
    const tokenKeys = [
      'backendToken',
      'firebaseToken',
      'token',
      'accessToken',
      'authToken'
    ]

    const tokenData: Record<string, string | null> = {}

    tokenKeys.forEach(key => {
      const token = localStorage.getItem(key)
      tokenData[key] = token ? `${token.substring(0, 30)}...` : null
    })

    setTokens(tokenData)
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Token Debug Information</h3>
      
      <div className="space-y-2 mb-4">
        {Object.entries(tokens).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="font-medium">{key}:</span>
            <span className={`text-sm ${value ? 'text-green-600' : 'text-red-600'}`}>
              {value || 'Not found'}
            </span>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={refreshTokens}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
        <button
          onClick={clearAllTokens}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All Tokens
        </button>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Go to Login
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Note:</strong> If no tokens are found, you may need to log in again.</p>
        <p>The API requires a valid authentication token to create question papers.</p>
      </div>
    </div>
  )
}
