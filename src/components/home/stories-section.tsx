import { getHomeStories } from "@/lib/data/stories";
import { SectionHeading } from "./section-heading";
import { StoriesCirclesClient } from "./stories-circles";

export async function StoriesSection() {
  const stories = await getHomeStories();

  return (
    <section className="mx-auto mt-3 h-[260px] max-w-[1412px] rounded-[6px] border border-neutral-300 bg-white p-2">
      <SectionHeading
        title="Categorias de lives mini videos"
        note="Area do card para adicionar os produtos 1412x260 pixel"
        href="/stories"
      />
      <StoriesCirclesClient stories={stories} />
    </section>
  );
}
