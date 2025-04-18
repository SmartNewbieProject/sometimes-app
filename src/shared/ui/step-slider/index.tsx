import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Pressable, LayoutChangeEvent } from 'react-native';
import { Text } from '@/src/shared/ui';
import { cn } from '@/src/shared/libs/cn';

interface StepSliderProps {
  min: number;
  max: number;
  step: number;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  startLabel?: string;
  endLabel?: string;
  className?: string;
  showSelectedValue?: boolean;
  valueFormatter?: (value: number) => string;
}

export function StepSlider({
  min,
  max,
  step,
  defaultValue = min,
  value: controlledValue,
  onChange,
  startLabel,
  endLabel,
  className,
  showSelectedValue = true,
  valueFormatter = (value) => `${value}`,
}: StepSliderProps) {
  // Internal state for uncontrolled component
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  // Track slider dimensions
  const [sliderWidth, setSliderWidth] = useState(0);
  
  // Determine if component is controlled or uncontrolled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  
  // Calculate the percentage for the thumb position
  const percentage = ((value - min) / (max - min)) * 100;
  
  // Update internal value when controlled value changes
  useEffect(() => {
    if (isControlled) {
      setInternalValue(controlledValue);
    }
  }, [isControlled, controlledValue]);

  // Handle value changes with step alignment
  const handleValueChange = (newValue: number) => {
    console.log('handleValueChange', newValue);
    
    // Ensure the value is within bounds
    const clampedValue = Math.max(min, Math.min(max, newValue));
    
    // Calculate steps from min
    const steps = Math.round((clampedValue - min) / step);
    
    // Calculate the value aligned to steps
    const steppedValue = min + (steps * step);
    
    // Final clamping to ensure we're within bounds
    const finalValue = Math.max(min, Math.min(max, steppedValue));
    
    console.log('finalValue', finalValue);
    
    // Update internal state if uncontrolled
    if (!isControlled) {
      setInternalValue(finalValue);
    }
    
    // Call onChange callback
    if (onChange) {
      onChange(finalValue);
    }
  };

  // Handle step button clicks
  const handleStepClick = (direction: 'prev' | 'next') => {
    console.log('handleStepClick', direction, value, step);
    
    const newValue = direction === 'next' 
      ? Math.min(max, value + step)
      : Math.max(min, value - step);
    
    console.log('newValue', newValue);
    handleValueChange(newValue);
  };

  // Handle slider track clicks
  const handleSliderPress = (event: any) => {
    if (!sliderWidth) return;
    
    // Get the touch position relative to the slider
    const touchX = event.nativeEvent.locationX;
    
    // Calculate the new value based on the touch position
    const newPercentage = (touchX / sliderWidth) * 100;
    const newValue = min + (newPercentage / 100) * (max - min);
    
    // Update value
    handleValueChange(newValue);
  };

  // Handle layout changes to get slider width
  const handleLayout = (event: LayoutChangeEvent) => {
    setSliderWidth(event.nativeEvent.layout.width);
  };

  return (
    <View className={cn("w-full", className)}>
      {/* Labels */}
      <View className="flex-row justify-between items-center mb-2">
        {startLabel && (
          <Text size="sm" textColor="dark" className="text-left">
            {startLabel}
          </Text>
        )}
        {endLabel && (
          <Text size="sm" textColor="dark" className="text-right">
            {endLabel}
          </Text>
        )}
      </View>
      
      {/* Slider container */}
      <View className="flex-row justify-between items-center">
        {/* Decrease button */}
        <TouchableOpacity 
          onPress={() => handleStepClick('prev')}
          disabled={value <= min}
          className={cn(
            "w-8 h-8 rounded-full bg-lightPurple flex items-center justify-center",
            value <= min && "opacity-50"
          )}
        >
          <Text size="md" weight="bold" textColor="purple">-</Text>
        </TouchableOpacity>
        
        {/* Slider track */}
        <View className="flex-1 mx-2 h-12 justify-center">
          <Pressable 
            onLayout={handleLayout}
            onPress={handleSliderPress}
            className="w-full h-3 bg-lightPurple rounded-full overflow-hidden"
          >
            {/* Active track */}
            <View 
              className="absolute top-0 left-0 h-full bg-primaryPurple rounded-full"
              style={{ width: `${percentage}%` }}
            />
            
            {/* Thumb */}
            <View 
              className="absolute top-0 w-8 h-8 bg-primaryPurple rounded-full -mt-2.5 items-center justify-center"
              style={{ left: `${percentage}%`, marginLeft: -16 }}
            >
              <View className="w-2 h-2 rounded-full bg-white" />
            </View>
          </Pressable>
        </View>
        
        {/* Increase button */}
        <TouchableOpacity 
          onPress={() => handleStepClick('next')}
          disabled={value >= max}
          className={cn(
            "w-8 h-8 rounded-full bg-lightPurple flex items-center justify-center",
            value >= max && "opacity-50"
          )}
        >
          <Text size="md" weight="bold" textColor="purple">+</Text>
        </TouchableOpacity>
      </View>
      
      {/* Selected value display */}
      {showSelectedValue && (
        <View className="mt-4 items-center">
          <Text size="md" weight="semibold" textColor="dark">
            {valueFormatter(value)}
          </Text>
        </View>
      )}
    </View>
  );
}

export interface FormStepSliderProps extends Omit<StepSliderProps, 'value' | 'onChange'> {
  name: string;
  control: any;
  rules?: any;
}

export function FormStepSlider({
  name,
  control,
  rules,
  ...props
}: FormStepSliderProps) {
  const { useController } = require('react-hook-form');

  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
    rules,
  });

  return (
    <StepSlider
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}
