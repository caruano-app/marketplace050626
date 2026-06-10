"use client";

import Image from "next/image";
import { useState } from "react";
import type { StoryVideo } from "@/types/database";

type FloatingStoriesWidgetProps = {
  stories: StoryVideo[];
  position?: "left" | "right";
};

export function FloatingStoriesWidget({ stories, position = "left" }: FloatingStoriesWidgetProps) {
  const [activeStory, setActiveStory] = useState<StoryVideo | null>(null);
  const firstStory = stories[0];

  if (!firstStory) {
    return null;
  }

  return (
    <>
      <button
        className={`fixed bottom-6 z-40 flex items-center gap-2 rounded-full border-2 border-[#f6b900] bg-white px-2 py-2 shadow-lg ${position === "left" ? "left-6" : "right-6"}`}
        onClick={() => setActiveStory(firstStory)}
        type="button"
      >
        <span className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-neutral-200">
          {firstStory.thumbnail_url ? (
            <Image
              alt={firstStory.titulo || "Story Caruano"}
              blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
              className="object-cover"
              fill
              placeholder="blur"
              sizes="56px"
              src={firstStory.thumbnail_url}
            />
          ) : (
            <span className="text-[10px] font-black text-neutral-500">LIVE</span>
          )}
        </span>
        <span className="rounded-full bg-[#f6b900] px-3 py-2 text-xs font-black uppercase text-neutral-950">
          {firstStory.chamada_acao || "Clique e assista"}
        </span>
      </button>

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
                  <p className="text-2xl font-black uppercase">{activeStory.titulo || "Live Caruano"}</p>
                  <p className="mt-3 text-sm font-bold uppercase">{activeStory.chamada_acao || "Clique e assista"}</p>
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
