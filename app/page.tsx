import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="grow">
        <div className="container mx-auto p-4"></div>
      </div>
      <Footer />
    </div>
  );
}
