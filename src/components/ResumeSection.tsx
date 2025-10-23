import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface ResumeSectionProps {
  title: string;
  content: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

export const ResumeSection = ({
  title,
  content,
  isVisible,
  onClose,
  className,
}: ResumeSectionProps) => {
  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-in fade-in-0"
        onClick={onClose}
      />
      
      {/* Slide-in panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[600px] md:w-[700px] bg-card shadow-2xl z-50 overflow-y-auto",
          "animate-in slide-in-from-right duration-300",
          className
        )}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-content border-b-2 border-accent pb-2 flex-1">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-4 hover:bg-accent/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="text-foreground font-content space-y-4">
            {content}
          </div>
        </div>
      </div>
    </>
  );
};
