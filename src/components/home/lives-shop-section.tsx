import { getLiveShopStories } from "@/lib/data/stories";
import { LiveCard } from "./live-card";
import { SectionHeading } from "./section-heading";

export async function LivesShopSection() {
  const stories = await getLiveShopStories();

  return (
    <section className="mx-auto mt-3 h-[482px] max-w-[1412px] rounded-[6px] border border-neutral-300 bg-white p-2">
      <SectionHeading
        title="Lives Sop"
        note="Area do card para adicionar as lives 1412x482 pixel"
        href="/lives"
        actionLabel="Ver todas v"
      />

      <div className="flex gap-4 overflow-x-auto pb-1">
        {stories.map((story) => (
          <LiveCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}
