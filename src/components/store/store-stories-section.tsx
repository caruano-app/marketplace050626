import { StoriesCirclesClient } from "@/components/home/stories-circles";
import type { StoryVideo } from "@/types/database";

type StoreStoriesSectionProps = {
  stories: StoryVideo[];
};

export function StoreStoriesSection({ stories }: StoreStoriesSectionProps) {
  return (
    <section className="mx-auto mt-3 rounded-[6px] border border-neutral-300 bg-white p-2">
      <div className="mb-2 flex h-8 items-center gap-4">
        <h2 className="text-xl font-black text-neutral-950">Lives mini videos (dos lojistas)</h2>
        <p className="hidden flex-1 text-center text-sm font-black uppercase text-neutral-500 md:block">
          Area do card para adicionar os produtos 1412x260 pixel
        </p>
      </div>
      <StoriesCirclesClient stories={stories} />
    </section>
  );
}
