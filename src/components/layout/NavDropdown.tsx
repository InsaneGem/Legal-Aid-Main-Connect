
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
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  // ✅ Close on outside click (IMPORTANT)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout
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
      {/* BUTTON */}
      <button
        className="relative flex items-center gap-1 px-3 py-2 text-sm font-medium 
        text-muted-foreground hover:text-foreground transition-colors duration-300

        after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 
        after:bg-primary after:transition-all after:duration-300 
        hover:after:w-full"
        onClick={() => setOpen((prev) => !prev)}
      >
        {section.title}

        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''
            }`}
        />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50">

          {/* 👇 invisible hover bridge (fix flicker) */}
          <div className="absolute -top-4 left-0 right-0 h-4" />

          <div
            className="min-w-[300px] rounded-2xl border border-border/50 
            bg-background/95 backdrop-blur-xl p-2 shadow-2xl
            
            animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
          >
            {section.items.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setOpen(false)}
                className="flex flex-col gap-0.5 rounded-xl px-4 py-3
                transition-all duration-200 
                hover:bg-primary/10 hover:scale-[1.02] group"
              >
                <span className="text-sm font-semibold text-foreground">
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