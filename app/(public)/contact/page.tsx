import {
  informationMetadata,
  PublicInformation,
} from "@/components/public-information";

export const metadata = informationMetadata("/contact");

export default function Page() {
  return <PublicInformation path="/contact" />;
}
