import type { ReactNode } from "react";
import { GoogleAuthProvider } from "@/components/providers/google-auth-provider";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GoogleAuthProvider>
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-[24rem]">{children}</div>
      </div>
    </GoogleAuthProvider>
  );
}
