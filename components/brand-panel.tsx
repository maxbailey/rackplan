"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { SunIcon, MoonIcon } from "lucide-react";

export default function BrandPanel() {
  const { setTheme, theme } = useTheme();

  return (
    <>
      <div className="flex flex-col gap-3 sticky top-6">
        <Card className="sticky top-6">
          <div className="flex flex-row justify-between items-center p-6 border-b border-border">
            <div className="flex flex-row gap-2 items-center">
              <Image
                src={
                  theme === "light"
                    ? "/rackplan-logo-black.svg"
                    : "/rackplan-logo-white.svg"
                }
                alt="rackplan.dev"
                width={30}
                height={30}
              />
              <h1 className="text-lg font-medium font-geist-mono tracking-tighter">
                rackplan
                <span className="text-muted-foreground">.dev</span>
              </h1>
            </div>
            <div className="flex flex-row items-center gap-2">
              {theme === "dark" ? (
                <Button
                  variant="ghost"
                  onClick={() => setTheme("light")}
                  data-umami-event="Switch Theme"
                  data-umami-event-theme="Light"
                >
                  <SunIcon className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setTheme("dark")}
                  data-umami-event="Switch Theme"
                  data-umami-event-theme="Dark"
                >
                  <MoonIcon className="w-4 h-4" />
                </Button>
              )}
              <a
                href="https://github.com/maxbailey/rackplan"
                target="_blank"
                data-umami-event="GitHub Link Click"
              >
                <Image
                  alt="GitHub Repo stars"
                  src="https://img.shields.io/github/stars/maxbailey/rackplan"
                  width={90}
                  height={20}
                  unoptimized
                />
              </a>
            </div>
          </div>
          <div className="flex flex-col p-6 gap-3">
            <h1 className="text-xl font-medium tracking-tight text-foreground">
              Plan your homelab server rack, with a completely free drag & drop
              tool.
            </h1>
            <p className="text-sm text-muted-foreground">
              Rack Plan is a simple, open-source tool designed to help you plan
              your homelab server rack with ease.
            </p>
          </div>
          <div className="p-6 border-t">
            <h2 className="text-sm mb-3">Transparency</h2>
            <p className="text-sm text-muted-foreground">
              Some products have a &quot;Buy Now&quot; link on them, and those
              use my Amazon Affiliate link. This is the only source of
              monetization for Rack Plan.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
