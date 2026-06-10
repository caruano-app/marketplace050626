import Image from "next/image";
import type { StoryVideo } from "@/types/database";

type LiveCardProps = {
  story: StoryVideo;
};

export function LiveCard({ story }: LiveCardProps) {
  return (
    <a
      className="flex h-[420px] w-[265px] shrink-0 flex-col overflow-hidden rounded-[6px] border border-neutral-300 bg-white p-2 shadow-sm"
      href={story.produto_id ? `/product/${story.produto_id}` : `/stories/${story.id}`}
    >
      <div className="relative grid flex-1 place-items-center rounded-[4px] bg-neutral-200">
        {story.thumbnail_url ? (
          <Image
            alt={story.titulo || "Live Caruano"}
            blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            className="object-cover"
            fill
            placeholder="blur"
            sizes="265px"
            src={story.thumbnail_url}
          />
        ) : (
          <span className="text-center text-xs font-black uppercase leading-tight text-neutral-500">
            Area do card
            <br />
            das lives
            <br />
            265x420 px
          </span>
        )}
      </div>
      <div className="mt-2 grid h-8 place-items-center rounded-[3px] bg-[#f6b900] px-2 text-sm font-black text-neutral-950">
        {story.titulo || "Live Caruano"}
      </div>
    </a>
  );
}
