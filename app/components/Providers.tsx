import { ImageKitProvider } from "@imagekit/next";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const urlEndPoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;

  return (
    <SessionProvider refetchInterval={5 * 60}>
      <ImageKitProvider urlEndpoint={urlEndPoint}>{children}</ImageKitProvider>
    </SessionProvider>
  );
}
