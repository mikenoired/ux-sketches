"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  backLink: string;
  workNumber?: string;
}

export default function PageWrapper({ children, title, backLink, workNumber }: PageWrapperProps) {
  return (
    <>
      <div className="p-5 w-dvw h-dvh fixed z-10">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Link href={backLink}>
              <ArrowLeft className="size-6 text-[var(--foreground)]" />
            </Link>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{title}</h1>
          </div>
          {workNumber && <div className="font-medium text-2xl text-[var(--muted-foreground)]">{workNumber}</div>}
        </div>
      </div>
      {children}
    </>
  );
}