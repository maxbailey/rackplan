"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { SunIcon, MoonIcon, Github } from "lucide-react";

export default function BrandSidebar() {
  const { setTheme, theme } = useTheme();

  return (
    <>
      <Card>
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
              <Button variant="ghost" onClick={() => setTheme("light")}>
                <SunIcon className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setTheme("dark")}>
                <MoonIcon className="w-4 h-4" />
              </Button>
            )}
            <a href="https://github.com/maxbailey/rackplan" target="_blank">
              <img
                alt="GitHub Repo stars"
                src="https://img.shields.io/github/stars/maxbailey/rackplan"
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
            Rack Plan is a simple, open-source drag-and-drop tool designed to
            help you plan your homelab server rack with ease. Quickly arrange
            servers, switches, and other components to visualize your setup.
            Consider leaving a star on GitHub.
          </p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() =>
              window.open("https://github.com/maxbailey/rackplan", "_blank")
            }
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </Button>
        </div>
      </Card>
    </>
  );
}
