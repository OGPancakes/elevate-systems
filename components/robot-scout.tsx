import { Bot } from "lucide-react";

export function RobotScout({ reverse = false }: { reverse?: boolean }) {
  return (
    <div aria-hidden="true" className={`robot-track ${reverse ? "robot-track-reverse" : ""}`}>
      <div className="robot-scout">
        <span className="robot-scout-body">
          <Bot className="h-4 w-4" />
        </span>
        <span className="robot-scout-leg robot-scout-leg-left" />
        <span className="robot-scout-leg robot-scout-leg-right" />
      </div>
    </div>
  );
}
