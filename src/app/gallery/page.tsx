"use client";
import React, { useEffect, useRef, useState } from "react";
import { images } from "../images";
import HumanOrAi from "@/components/HumanOrAi";
import { getIpfsImage } from "../../../utils/ipfs";
export default function Page() {
  const assertions = useRef<any[]>([]);
  const [imageGallery, setImageGallery] = useState<any[]>([]);
  
  const getAllIpfsImages = async () => {
    let _imageGallery = new Array();
    await Promise.all(
      assertions.current.map(async (e, i) => {
        console.log(e);
        let image = await getIpfsImage(e.ImageUrl);
        console.log(_imageGallery, imageGallery);
        _imageGallery.push(image);
      })
    );

    setImageGallery(_imageGallery);
  };

  useEffect(() => {
    setImageGallery([]);
    try {
      const fetching = async () => {
        console.log("beginning of fetch");
        const resp = await fetch(
          "https://stark-sea-51933.herokuapp.com/api/assertions"
        );
        const jsonResp = await resp.json();
        assertions.current = jsonResp.data;
        console.log(assertions.current)
        assertions.current = assertions.current.filter(assertion => assertion.Resolved)
        getAllIpfsImages();
      };
      fetching();
    } catch (error) {
      console.log("API fetch error", error);
    }
  }, []);

  console.log("assertions", assertions.current);
  return (
    <div className="w-screen px-12 py-24 flex flex-col items-center">
      <div className="text-3xl font-bold mb-12">Curated human image gallery</div>
      {/* <HumanOrAi onAIClick={null} onHumanClick={null} /> */}
      <div className="flex flex-row flex-wrap w-full p-auto gap-3 justify-center">
        {imageGallery.map((link, i) => {
          return (
            <img
              key={i}
              src={link}
              className="w-[300px] h-[200px] object-cover rounded-lg"
            />
          );
        })}
      </div>
    </div>
  );
}
