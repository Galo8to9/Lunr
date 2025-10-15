import React from "react";
import Link from "next/link";
import { Moon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SignInButton } from "./SignInButton";

const LoginCard: React.FC = () => {
  return (
    <div className="relative mx-auto w-full max-w-md p-4 hover:cursor-pointer">
      {/* soft glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-white/10 via-transparent to-transparent blur-2xl opacity-30" />

      <Card className="relative overflow-hidden border border-white/10 bg-background/60 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_60px_-20px_rgba(0,0,0,0.45)]">
        {/* faint corner sheen */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-3xl" />

        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="inline-flex items-center gap-1">
              <Moon
                className="h-10 w-10 text-foreground/90"
                aria-hidden="true"
              />
              <span className="text-foreground text-5xl">Lunr</span>
            </Link>
          </div>
          <div>
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your Lunr account</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              placeholder="you@domain.com"
              className="border-white/10 bg-transparent focus-visible:ring-1 focus-visible:ring-white/30"
              disabled
            />
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot"
                className="text-xs text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              className="border-white/10 bg-transparent focus-visible:ring-1 focus-visible:ring-white/30"
              disabled
            />
          </div>

          {/* Primary action */}
          <Button
            className="w-full border-white/10 bg-background/60 text-foreground shadow-sm backdrop-blur-xl transition-colors hover:bg-background/70"
            variant="outline"
            disabled
          >
            Sign in
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="rounded bg-background/60 px-2 text-foreground/60 backdrop-blur">
                or continue with
              </span>
            </div>
          </div>

          {/* Your custom provider button */}
          <SignInButton />
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-2">
          <p className="text-center text-xs text-foreground/60">
            By continuing you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </CardFooter>
      </Card>

      {/* subtle ring on hover (matches Navbar vibe) */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] ring-1 ring-inset ring-white/10 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
};

export default LoginCard;
