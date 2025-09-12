"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { FriendsList } from "./friends-list";

export default function FriendsMenu() {
  return (
    <div className="bg-background flex flex-col w-full h-full">
      <div className="flex items-center justify-between h-12 border-b px-6">
        <div className="flex items-center gap-2">
          <span className="font-medium">Friends</span>
          <span className="bg-accent align-baseline rounded-full h-1.5 w-1.5 mx-2" />
          <Button variant="ghost" size="sm">
            All Friends
          </Button>
          <Button variant="ghost" size="sm">
            Online
          </Button>
        </div>
        <Button className={cn()}>
          Add Friends
        </Button>
      </div>
      <Suspense fallback={<div>loading...</div>}>
        <FriendsList />
      </Suspense>
    </div>
  )
}