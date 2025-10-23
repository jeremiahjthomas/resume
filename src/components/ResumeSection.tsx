import { cn } from "@/lib/utils";

interface ResumeSectionProps {
  title: string;
  content: React.ReactNode;
  isVisible: boolean;
  className?: string;
}

export const ResumeSection = ({
  title,
  content,
  isVisible,
  className,
}: ResumeSectionProps) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "animate-slide-up bg-card rounded-lg p-6 sm:p-8 shadow-lg border-2 border-border",
        className
      )}
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 font-content border-b-2 border-accent pb-2">
        {title}
      </h2>
      <div className="text-foreground font-content space-y-4">
        {content}
      </div>
    </div>
  );
};
