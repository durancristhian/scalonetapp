import {
  informationMetadata,
  PublicInformation,
} from "@/components/public-information";

export const metadata = informationMetadata("/about");

export default function Page() {
  return <PublicInformation path="/about" />;
}
