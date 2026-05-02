import React, { useState } from 'react';
import { Slider } from '../../components/ui/slider';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export const CustomPaddingField = {
  type: "custom" as const,
  render: ({ name, value, onChange }: any) => {
    return (
      <div className="flex flex-col gap-2">
        <Label className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Padding {name}</Label>
        <div className="flex items-center gap-4">
          <Slider 
            value={[value || 0]} 
            max={400} 
            step={8} 
            onValueChange={(vals) => onChange(vals[0])} 
            className="flex-1"
          />
          <span className="text-xs text-gray-300 w-8">{value || 0}px</span>
        </div>
      </div>
    );
  }
};

export const CustomColorField = {
  type: "custom" as const,
  render: ({ name, value, onChange }: any) => {
    return (
      <div className="flex flex-col gap-2">
        <Label className="text-xs uppercase text-gray-500 font-semibold tracking-wider">{name.replace(/([A-Z])/g, ' $1').trim()}</Label>
        <div className="flex items-center gap-3">
          <Input 
            type="color" 
            value={value || '#ffffff'} 
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 p-0 border-none rounded-md overflow-hidden cursor-pointer"
          />
          <Input 
            type="text" 
            value={value || '#ffffff'} 
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent text-xs h-8"
          />
        </div>
      </div>
    );
  }
};

export const ConstrainedTypographyField = {
  type: "custom" as const,
  render: ({ name, value, onChange }: any) => {
    const fontPairings = [
      { label: "Classic (Playfair & Inter)", value: "classic" },
      { label: "Modern (Montserrat & Open Sans)", value: "modern" },
      { label: "Editorial (Prata & Lora)", value: "editorial" },
      { label: "Minimalist (Inter & Inter)", value: "minimalist" }
    ];

    return (
      <div className="flex flex-col gap-2">
        <Label className="text-xs uppercase text-gray-500 font-semibold tracking-wider">{name}</Label>
        <Select value={value || "classic"} onValueChange={onChange}>
          <SelectTrigger className="w-full text-xs h-8">
            <SelectValue placeholder="Select styling" />
          </SelectTrigger>
          <SelectContent>
            {fontPairings.map((pair) => (
              <SelectItem key={pair.value} value={pair.value} className="text-xs">
                {pair.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
};
