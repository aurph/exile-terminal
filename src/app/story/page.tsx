import { getProgress } from "@/lib/save-server";
import { PageHeader } from "@/components/ui/PageHeader";
import { StoryTracker } from "@/components/story/StoryTracker";

export const dynamic = "force-dynamic";

export default async function StoryPage() {
  const checked = await getProgress();

  return (
    <div className="reveal">
      <PageHeader
        eyebrow="Campaign · Patch 0.5"
        title="The Fast Road"
        sub="The 0.5 campaign as a speed run to maps: both Ascendancy trials, the high-value pickups, and every act reward in order. Check things off as you go, it saves to this browser."
      />
      <StoryTracker initialChecked={checked} />
    </div>
  );
}
