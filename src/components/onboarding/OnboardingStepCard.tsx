import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle } from 'lucide-react';
interface OnboardingStepCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  isComplete: boolean;
  isRequired?: boolean;
  children: ReactNode;
  className?: string;
}
export const OnboardingStepCard = ({
  title,
  description,
  icon,
  isComplete,
  isRequired = true,
  children,
  className,
}: OnboardingStepCardProps) => {
  return (
    <Card className={cn(
      "transition-all duration-300 border-2",
      isComplete 
        ? "border-emerald-500/30 bg-emerald-500/5" 
        : isRequired 
          ? "border-amber-500/30 bg-amber-500/5" 
          : "border-border",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
              isComplete 
                ? "bg-emerald-500/10 text-emerald-600" 
                : "bg-primary/10 text-primary"
            )}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{title}</CardTitle>
                {isRequired && (
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <div className="flex-shrink-0">
            {isComplete ? (
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Complete</span>
              </div>
            ) : isRequired ? (
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Incomplete</span>
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};