"use client";

import Header from "@/components/Header";
import { images } from "../images";
import { useEffect, useRef, useState } from "react";
import HumanOrAi from "@/components/HumanOrAi";
import { ethers } from "ethers";
import ooAbi from "../../abis/OOV3.json";
import { useAccount } from "wagmi";
import { keccak256 } from "viem";
import { toUtf8Bytes } from "ethers/lib/utils";

export default function Page() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const assertions = useRef<any[]>([]);

  // const [assertions, setAssertions] = useState<any[]>([]);
  const [signer, setSigner] = useState(
    new ethers.providers.Web3Provider(window.ethereum as any).getSigner()
  );
  const { address } = useAccount();
  const [currentImage, setCurrentImage] = useState<string>("");

  function getIpfsImage() {
    console.log("ASSERTIONS", assertions.current);
    console.log(assertions.current[0].ImageUrl);
    fetch(
      `https://image-dispute.infura-ipfs.io/ipfs/${assertions.current[currentIndex].ImageUrl}`,
      {
        method: "GET",
      }
    )
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        setCurrentImage(data);
      });
  }

  useEffect(() => {
    const date = new Date();
    fetch(" https://stark-sea-51933.herokuapp.com/api/assertions")
      .then((resp) => resp.json())
      .then((data) => (assertions.current = data.data))
      .then(() => {
        date.setMilliseconds(0);
        assertions.current = assertions.current.filter((assertion) => {
          console.log(assertion.Disputed, assertion);
          console.log(parseInt(assertion.ResolvableAt as string) >
          date.getTime() / 1000, assertion)
          return (
            (parseInt(assertion.ResolvableAt as string) >
              date.getTime() / 1000) && !assertion.Disputed
          );
        });
        if (assertions.current.length) getIpfsImage();
      });

    //@ts-ignore
    window.ethereum.on("accountsChanged", async function () {
      setSigner(
        new ethers.providers.Web3Provider(window.ethereum as any).getSigner()
      );
    });
  }, []);

  const [oo, setOo] = useState(
    new ethers.Contract(
      "0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB",
      ooAbi,
      signer
    )
  );

  if (
    currentIndex > assertions.current.length ||
    assertions.current.length === 0
  ) {
    return (
      <div className=" h-screen w-screen flex flex-col items-center justify-center py-6 gap-6">
        <div>No more images to dispute</div>
      </div>
    );
  }

  function passToNext() {
    setCurrentIndex(currentIndex + 1);
    if (currentIndex >= assertions.current.length) return;
    getIpfsImage();
  }

  async function disputeAssertion(assertionId: any) {
    try {
      const tx = await oo.disputeAssertion(assertionId, address);
      await tx.wait();
      return true;
    } catch (e: any) {
      if (e.error === undefined) {
        console.log("error: ", e.message);
        return false;
      }
      console.log("an error occurred: ", e.error.message);
      return false;
    }
  }

  async function onDisputeClick() {
    let _imagePreview = currentImage;
    if(!assertions.current) return
    console.log(currentIndex, assertions.current[currentIndex])
    setCurrentImage("https://i.imgur.com/JuU08.gif");
    const resp = await disputeAssertion(
      assertions.current[currentIndex].AssertionId
    );
    if (resp === true) {
      setCurrentImage(
        "https://uploads.commoninja.com/searchengine/wordpress/2bc-form-security.png"
      );
      const date = new Date();

      fetch("https://stark-sea-51933.herokuapp.com/api/assertions")
        .then((resp) => resp.json())
        .then((data) => (assertions.current = data.data))
        .then(() => {
          date.setMilliseconds(0);
          assertions.current = assertions.current?.filter((assertion) => {
            console.log(assertion.Disputed);
            return (
              parseInt(assertion.ResolvableAt as string) >
                date.getTime() / 1000 && !assertion.Disputed
            );
          });
        });
    setCurrentIndex(currentIndex + 1);

      // passToNext();
    }
    else
      setCurrentImage(_imagePreview)
  }

  console.log("assertions", assertions);
  return (
    <div className="h-screen w-screen flex flex-col items-center py-24 gap-6">
      {/* <h1 className="font-bold text-5xl">Challenge submissions</h1> */}
      <h1 className="font-bold text-5xl">Is this a human image or AI generated?</h1>
      <h3 className="-mt-6">If you dispute someone's submission, you can earn the assertion bound if the community agrees with you</h3>
      {currentImage !==
        "https://uploads.commoninja.com/searchengine/wordpress/2bc-form-security.png" && (
        <HumanOrAi onHumanClick={passToNext} onAIClick={onDisputeClick} />
      )}
      {currentImage ===
        "https://uploads.commoninja.com/searchengine/wordpress/2bc-form-security.png" && (
        <button
          onClick={passToNext}
          className="text-2xl cursor-pointer fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
        >
          Next Image
        </button>
      )}
      {currentImage && (
        <img className="w-[600px] rounded-lg" src={currentImage} />
      )}
    </div>
  );
}
