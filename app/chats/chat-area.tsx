import { useState } from "react";
import { useSocket } from "@/context/socket-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

/* --- Chat Area --- */
export function ChatArea() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setMessage("");
  };

  return (
    <div className="flex flex-col flex-1 w-full bg-background text-foreground min-h-0">
      {/* main chat area */}
      <main className="flex flex-col flex-1 min-h-0">
        {/* messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className="p-2 rounded-md bg-muted text-foreground"
              >
                {msg}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* input */}
        <Card className="flex flex-row p-4 m-2 gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend}>Send</Button>
        </Card>
      </main>
    </div>
  );
}