import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X, Plus, Globe } from 'lucide-react';
const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'zh', label: 'Mandarin', flag: '🇨🇳' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', label: 'Portuguese', flag: '🇧🇷' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
];
interface LanguageSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}
export const LanguageSelector = ({
  selected,
  onChange,
}: LanguageSelectorProps) => {
  const toggleLanguage = (label: string) => {
    if (selected.includes(label)) {
      // Don't allow removing last language
      if (selected.length > 1) {
        onChange(selected.filter(l => l !== label));
      }
    } else {
      onChange([...selected, label]);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Globe className="h-4 w-4" />
        <p>Select languages you can consult in</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {LANGUAGE_OPTIONS.map((lang) => {
          const isSelected = selected.includes(lang.label);
          
          return (
            <Badge
              key={lang.code}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer py-2 px-3 text-sm transition-all duration-200 hover:scale-105",
                isSelected && "bg-primary hover:bg-primary/90",
                !isSelected && "hover:bg-primary/10 hover:border-primary"
              )}
              onClick={() => toggleLanguage(lang.label)}
            >
              <span className="mr-1.5 text-base">{lang.flag}</span>
              {lang.label}
              {isSelected ? (
                <X className="h-3 w-3 ml-2" />
              ) : (
                <Plus className="h-3 w-3 ml-2" />
              )}
            </Badge>
          );
        })}
      </div>
      
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} language{selected.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
};