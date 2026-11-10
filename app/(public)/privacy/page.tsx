import {
  informationMetadata,
  PublicInformation,
} from "@/components/public-information";

export const metadata = informationMetadata("/privacy");

export default function Page() {
  return <PublicInformation path="/privacy" />;
}
