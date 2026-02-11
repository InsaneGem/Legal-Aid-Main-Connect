import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  isCurrent: boolean;
}
interface OnboardingProgressProps {
  steps: OnboardingStep[];
  currentStep: number;
}
export const OnboardingProgress = ({ steps, currentStep }: OnboardingProgressProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Onboarding Progress</h3>
        <span className="text-sm font-medium text-primary">
          {steps.filter(s => s.isComplete).length}/{steps.length} Complete
        </span>
      </div>
      
      <div className="relative">
        {/* Progress bar background */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(steps.filter(s => s.isComplete).length / steps.length) * 100}%` }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={cn(
                "flex flex-col items-center gap-2 flex-1",
                index === 0 && "items-start",
                index === steps.length - 1 && "items-end"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                step.isComplete && "bg-primary text-primary-foreground",
                step.isCurrent && !step.isComplete && "bg-primary/20 text-primary border-2 border-primary",
                !step.isComplete && !step.isCurrent && "bg-muted text-muted-foreground"
              )}>
                {step.isComplete ? (
                  <CheckCircle className="h-5 w-5" />
                ) : step.isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <div className={cn(
                "text-center",
                index === 0 && "text-left",
                index === steps.length - 1 && "text-right"
              )}>
                <p className={cn(
                  "text-xs font-medium",
                  step.isComplete || step.isCurrent ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};