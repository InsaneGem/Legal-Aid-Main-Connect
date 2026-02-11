import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X, Plus } from 'lucide-react';
const SPECIALIZATION_OPTIONS = [
  { id: 'criminal', label: 'Criminal Law', icon: '⚖️' },
  { id: 'family', label: 'Family Law', icon: '👨‍👩‍👧‍👦' },
  { id: 'corporate', label: 'Corporate Law', icon: '🏢' },
  { id: 'civil', label: 'Civil Law', icon: '📋' },
  { id: 'real-estate', label: 'Real Estate', icon: '🏠' },
  { id: 'immigration', label: 'Immigration', icon: '🌍' },
  { id: 'tax', label: 'Tax Law', icon: '💰' },
  { id: 'ip', label: 'Intellectual Property', icon: '💡' },
  { id: 'labor', label: 'Labor Law', icon: '👷' },
  { id: 'environmental', label: 'Environmental Law', icon: '🌿' },
  { id: 'consumer', label: 'Consumer Law', icon: '🛒' },
  { id: 'banking', label: 'Banking Law', icon: '🏦' },
  { id: 'cyber', label: 'Cyber Law', icon: '💻' },
  { id: 'constitutional', label: 'Constitutional Law', icon: '📜' },
];
interface SpecializationSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
}
export const SpecializationSelector = ({
  selected,
  onChange,
  maxSelections = 5,
}: SpecializationSelectorProps) => {
  const toggleSpecialization = (label: string) => {
    if (selected.includes(label)) {
      onChange(selected.filter(s => s !== label));
    } else if (selected.length < maxSelections) {
      onChange([...selected, label]);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Select up to {maxSelections} specializations
        </p>
        <Badge variant="outline" className={cn(
          selected.length === 0 && "text-amber-600 border-amber-500/30"
        )}>
          {selected.length}/{maxSelections} selected
        </Badge>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {SPECIALIZATION_OPTIONS.map((spec) => {
          const isSelected = selected.includes(spec.label);
          const isDisabled = !isSelected && selected.length >= maxSelections;
          
          return (
            <Badge
              key={spec.id}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer py-2.5 px-4 text-sm transition-all duration-200 hover:scale-105",
                isSelected && "bg-primary hover:bg-primary/90",
                isDisabled && "opacity-50 cursor-not-allowed hover:scale-100",
                !isSelected && !isDisabled && "hover:bg-primary/10 hover:border-primary"
              )}
              onClick={() => !isDisabled && toggleSpecialization(spec.label)}
            >
              <span className="mr-1.5">{spec.icon}</span>
              {spec.label}
              {isSelected ? (
                <X className="h-3 w-3 ml-2" />
              ) : (
                <Plus className="h-3 w-3 ml-2" />
              )}
            </Badge>
          );
        })}
      </div>
      
      {selected.length === 0 && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          Please select at least one specialization
        </p>
      )}
    </div>
  );
};