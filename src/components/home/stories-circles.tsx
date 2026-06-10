"use client";

import Image from "next/image";
import { useState } from "react";
import type { StoryVideo } from "@/types/database";

type StoriesCirclesClientProps = {
  stories: StoryVideo[];
};

export function StoriesCirclesClient({ stories }: StoriesCirclesClientProps) {
  const [activeStory, setActiveStory] = useState<StoryVideo | null>(null);

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-1">
        {stories.map((story) => (
          <button
            className="w-[160px] shrink-0 text-center"
            key={story.id}
            onClick={() => setActiveStory(story)}
            type="button"
          >
            <span className="relative grid h-[160px] w-[160px] place-items-center overflow-hidden rounded-full border border-neutral-300 bg-neutral-200">
              {story.thumbnail_url ? (
                <Image
                  alt={story.titulo || "Story Caruano"}
                  blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                  className="object-cover"
                  fill
                  placeholder="blur"
                  sizes="160px"
                  src={story.thumbnail_url}
                />
              ) : (
                <span className="text-center text-[10px] font-black uppercase leading-tight text-neutral-500">
                  Videos da live
                  <br />
                  160x160 pixel
                </span>
              )}
            </span>
            <span className="mt-2 block truncate text-lg font-black text-neutral-950">{story.titulo || "Story Caruano"}</span>
          </button>
        ))}
      </div>

      {activeStory ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 px-4" role="dialog" aria-modal="true">
          <div className="relative h-[720px] max-h-[90vh] w-[405px] max-w-full overflow-hidden rounded-[8px] bg-neutral-950">
            <button
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white text-lg font-black text-neutral-950"
              onClick={() => setActiveStory(null)}
              type="button"
            >
              X
            </button>

            {activeStory.video_url ? (
              <video className="h-full w-full object-cover" controls playsInline src={activeStory.video_url} />
            ) : (
              <div className="grid h-full place-items-center bg-neutral-800 p-6 text-center text-white">
                <div>
                  <p className="text-2xl font-black uppercase">{activeStory.titulo || "Story Caruano"}</p>
                  <p className="mt-3 text-sm font-bold uppercase">{activeStory.chamada_acao || "Clique e assista"}</p>
                  <p className="mt-8 text-xs uppercase text-neutral-300">Mock visual ate o Storage stories receber videos.</p>
                </div>
              </div>
            )}

            {activeStory.produto_id ? (
              <a
                className="absolute bottom-4 left-4 right-4 grid h-11 place-items-center rounded-[4px] bg-[#f6b900] text-sm font-black uppercase text-neutral-950"
                href={`/product/${activeStory.produto_id}`}
              >
                Ver produto
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
