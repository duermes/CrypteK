//chat-box.tsx

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

export function ChatBox({
  name,
  time,
  messagePreview,
}: {
  name: string;
  time: string;
  messagePreview: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 cursor-pointer">
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src="/abstract-profile.png" />
          <AvatarFallback className="bg-secondary/10 text-secondary">
            {name}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{name}</p>
            <span className="text-xs text-muted-foreground">{time}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {messagePreview}
          </p>
        </div>
      </div>
    </div>
  );
}
