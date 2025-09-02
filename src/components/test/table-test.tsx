'use client';

import React from 'react';
import { EnhancedTextRenderer } from '@/components/ui/enhanced-text-renderer';

export function TableTest() {
  // Test data that mimics the malformed table from the user's issue
  const malformedTableText = `The following age group are included in the proportion indicated | Age Group | Relative Proportion in <br> Population | | :-- | :-- | | 
12
−
17
12−17 | 0.17 | | 
18
−
23
18−23 | 0.31 | | 
24
−
29
24−29 | 0.27 | | 
30
−
35
30−35 | 0.21 | | 
36
+
36+ | 0.04 | How many of each age group should be included in a sample of 3000 people to make the sample representative?`;

  // Test data with proper markdown table
  const properTableText = `The following age group are included in the proportion indicated

| Age Group | Relative Proportion in Population |
| :-- | :-- |
| 12−17 | 0.17 |
| 18−23 | 0.31 |
| 24−29 | 0.27 |
| 30−35 | 0.21 |
| 36+ | 0.04 |

How many of each age group should be included in a sample of 3000 people to make the sample representative?`;

  // Test data with math and tables
  const mathAndTableText = `Consider the quadratic equation $ax^2 + bx + c = 0$ where the coefficients are:

| Coefficient | Value | Description |
| :-- | :-- | :-- |
| $a$ | 2 | Leading coefficient |
| $b$ | -5 | Linear coefficient |
| $c$ | 3 | Constant term |

The discriminant is calculated as: $$\\Delta = b^2 - 4ac$$

Substituting the values: $$\\Delta = (-5)^2 - 4(2)(3) = 25 - 24 = 1$$`;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Table Rendering Test</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">1. Malformed Table (Original Issue)</h2>
        <div className="border p-4 bg-gray-50">
          <h3 className="font-medium mb-2">Raw Text:</h3>
          <pre className="text-xs bg-white p-2 border rounded overflow-x-auto">
            {malformedTableText}
          </pre>
        </div>
        <div className="border p-4">
          <h3 className="font-medium mb-2">Rendered Result:</h3>
          <EnhancedTextRenderer text={malformedTableText} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">2. Proper Markdown Table</h2>
        <div className="border p-4 bg-gray-50">
          <h3 className="font-medium mb-2">Raw Text:</h3>
          <pre className="text-xs bg-white p-2 border rounded overflow-x-auto">
            {properTableText}
          </pre>
        </div>
        <div className="border p-4">
          <h3 className="font-medium mb-2">Rendered Result:</h3>
          <EnhancedTextRenderer text={properTableText} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">3. Math + Table Combination</h2>
        <div className="border p-4 bg-gray-50">
          <h3 className="font-medium mb-2">Raw Text:</h3>
          <pre className="text-xs bg-white p-2 border rounded overflow-x-auto">
            {mathAndTableText}
          </pre>
        </div>
        <div className="border p-4">
          <h3 className="font-medium mb-2">Rendered Result:</h3>
          <EnhancedTextRenderer text={mathAndTableText} />
        </div>
      </div>
    </div>
  );
}
