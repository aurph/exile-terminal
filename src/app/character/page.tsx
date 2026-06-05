import { CharacterView } from "@/components/character/CharacterView";

/** The build lives in the visitor's localStorage; the view is fully client-side. */
export default function CharacterPage() {
  return <CharacterView />;
}
