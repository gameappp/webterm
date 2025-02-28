import "./globals.css";
import "../css/styles.css";
import { Providers } from "./providers";

export const metadata ={
  title:"Chess Game"
}

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body className="max-w-[412px] w-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
