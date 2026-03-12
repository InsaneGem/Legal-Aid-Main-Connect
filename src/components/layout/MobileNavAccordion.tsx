import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import type { NavMenuSection } from './navMenuConfig';
interface MobileNavAccordionProps {
  sections: NavMenuSection[];
  onNavigate: () => void;
}
export const MobileNavAccordion = ({ sections, onNavigate }: MobileNavAccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);
  return (
    <div className="flex flex-col gap-1">
      {sections.map((section, i) => (
        <div key={section.title}>
          <button
            onClick={() => toggle(i)}
            className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground"
          >
            {section.title}
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                openIndex === i ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === i && (
            <div className="ml-3 flex flex-col gap-0.5 border-l border-border pl-3 pb-2 animate-fade-in">
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={onNavigate}
                  className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};