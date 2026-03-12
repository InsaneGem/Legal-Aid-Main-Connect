import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import type { NavMenuSection } from './navMenuConfig';
interface NavDropdownProps {
  section: NavMenuSection;
}
export const NavDropdown = ({ section }: NavDropdownProps) => {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline-animation"
        onClick={() => setOpen((prev) => !prev)}
      >
        {section.title}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
          <div className="min-w-[260px] rounded-lg border border-border bg-popover p-2 shadow-elegant animate-fade-in">
            {section.items.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setOpen(false)}
                className="flex flex-col gap-0.5 rounded-md px-3 py-2.5 transition-colors hover:bg-secondary group"
              >
                <span className="text-sm font-medium text-foreground group-hover:text-foreground">
                  {item.label}
                </span>
                {item.description && (
                  <span className="text-xs text-muted-foreground leading-snug">
                    {item.description}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};