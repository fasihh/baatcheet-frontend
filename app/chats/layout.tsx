"use client";

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils";
import { User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation";

const menuOptions = [
  {
    name: "Friends",
    icon: User,
    path: '/chats'
  }
];

export default function ChatLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  return (
    <div className="bg-sidebar h-screen flex flex-col">
      {/* top nav */}
      <div className="h-10">top nav</div>

      {/* main area */}
      <div className="flex flex-1 min-h-0">
        <div className="p-2 w-16 bg-sidebar">
          servers
        </div>

        <div className="flex flex-1 border-l border-t rounded-t-md min-h-0">
          <div className="flex flex-col gap-2 w-sm h-full">
            <div className="flex items-center justify-center h-12 border-b">
              <span className="font-medium">Direct Messages</span>
            </div>
            <div className="px-2">
              {menuOptions.map(item => (
                <Link href={item.path} key={item.name}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex justify-start w-full hover:bg-sidebar-accent",
                      item.path === pathname && "bg-muted"
                    )}
                  >
                    <item.icon />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
            <Separator />
            <div>
              chats
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}