import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { TeamsOrganizer } from "@/components/teams-organizer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="grow">
        <TeamsOrganizer />
      </div>
      <Footer />
    </div>
  );
}
