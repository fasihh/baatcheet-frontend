"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 justify-center items-center bg-background h-screen">
      <div className="flex items-center gap-2">
        <div className="text-4xl font-semibold">
          Hello World!
        </div>
        <ModeToggle />
      </div>
      <Link href="/chats">
        <Button size="sm" className="flex items-center w-32">
          <span className="mb-0.5">Chats</span>
          <ArrowRight />
        </Button>
      </Link>
    </div>
  );
}