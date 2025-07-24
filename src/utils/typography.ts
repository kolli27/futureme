import { cn } from '@/lib/utils'

// Typography utility classes based on PRD design system
export const typography = {
  // Display text (SF Pro equivalent for headings)
  display: {
    xl: 'text-4xl font-bold font-display leading-tight tracking-tight',
    lg: 'text-3xl font-bold font-display leading-tight tracking-tight',
    md: 'text-2xl font-semibold font-display leading-tight tracking-tight',
    sm: 'text-xl font-semibold font-display leading-tight tracking-tight',
    xs: 'text-lg font-semibold font-display leading-tight tracking-tight',
  },
  
  // Body text (Inter for readability)
  body: {
    lg: 'text-lg leading-relaxed',
    md: 'text-base leading-relaxed',
    sm: 'text-sm leading-relaxed',
    xs: 'text-xs leading-relaxed',
  },
  
  // UI text (medium weight for interface elements)
  ui: {
    lg: 'text-lg font-medium leading-normal',
    md: 'text-base font-medium leading-normal',
    sm: 'text-sm font-medium leading-normal',
    xs: 'text-xs font-medium leading-normal',
  },
  
  // Caption text
  caption: 'text-xs text-muted-foreground leading-normal',
  
  // Monospace for code/data
  code: 'font-mono text-sm',
}

// Helper function to combine typography classes
export function getTypographyClass(
  category: keyof typeof typography,
  size?: string,
  additionalClasses?: string
): string {
  const baseClass = typeof typography[category] === 'object' 
    ? typography[category][size as keyof typeof typography[typeof category]] || ''
    : typography[category]
    
  return cn(baseClass, additionalClasses)
}

// Preset combinations for common use cases
export const typographyPresets = {
  heroTitle: getTypographyClass('display', 'xl', 'text-gradient-primary'),
  sectionTitle: getTypographyClass('display', 'lg'),
  cardTitle: getTypographyClass('display', 'md'),
  cardDescription: getTypographyClass('body', 'md', 'text-muted-foreground'),
  buttonText: getTypographyClass('ui', 'sm'),
  inputLabel: getTypographyClass('ui', 'sm'),
  helperText: getTypographyClass('caption'),
}