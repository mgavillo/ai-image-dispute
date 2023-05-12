"use client";

import Image from "next/image";
import { Children, ReactNode, useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useWalletClient,
  useContractWrite,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import ethers, { Signer } from "ethers";
import { publicProvider } from "wagmi/providers/public";
import {
  WagmiConfig,
  WalletClient,
  configureChains,
  Chain,
  mainnet,
  createConfig,
} from "wagmi";
import { Component } from "react";
import type { AppProps } from "next/app";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { InjectedConnector } from "wagmi/connectors/injected";
import { createPublicClient, http } from "viem";
import detectorAbi from "../abis/DeepFakeDetector.json";
import ooAbi from "../abis/OOV3.json";

import Header from "../components/Header";
import { createIPFSNode, uploadIpfsImage } from "../../utils/ipfs";
import { Blob } from "buffer";
import SelectImage from "./SelectImage";
import SelectedImage from "./SelectedImage";
import Link from "next/link";
import { keccak256, sha256, toUtf8Bytes } from "ethers/lib/utils";
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: [
    // connectors is to connect your wallet, defaults to InjectedConnector();
    // new MetaMaskConnector({ chains }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
});

export default function Home({ children }: { children: ReactNode }) {
  const { data: walletClient } = useWalletClient();
  // const [signer, setSigner] = useState(new ethers.providers.Web3Provider(window.ethereum).getSigner())
  const [fileBuffer, setFileBuffer] = useState(null);
  const [selectedImage, setSelectedImage] = useState<any>();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [cid, setCid] = useState<any>();
  const [signer, setSigner] = useState(
    new ethers.providers.Web3Provider(window.ethereum as any).getSigner()
  );
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();

  useEffect(() => {
    //@ts-ignore
    window.ethereum.on("accountsChanged", async function () {
      setSigner(
        new ethers.providers.Web3Provider(window.ethereum as any).getSigner()
      );
    });
  }, []);

  const [deepFakeDetector, setDeepFakeDetector] = useState(
    new ethers.Contract(
      "0x85627Ef94079BDFcC5c6079e2CE266Fd9A2C5841",
      detectorAbi,
      signer
    )
  );
  const [oo, setOo] = useState(
    new ethers.Contract(
      "0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB",
      ooAbi,
      signer
    )
  );

  /**
   *
   * @param imgId the hash of the image
   * @param imgUrl the IPFS link to the image
   */
  async function assertImage(imgId: string, imgUrl: string) {
    console.log("in assert image");

    try {
      console.log("in assert image");

      const tx = await deepFakeDetector.assertDataFor(imgId, imgUrl, address);
      console.log(tx);
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

  async function onSubmit(event: any) {
    console.log("0")
    if (!selectedImage) return;
    console.log("1")
    if (chain?.id !== 5 || !chain) {
      console.log(chain, chain?.name)
      if (switchNetwork) switchNetwork(5);
      else if (!switchNetwork || !chain) {
        alert("Change your chain to testnet goerli.");
        return;
      }
      if (chain?.name !== "Chain 5") return;
    }
    console.log("coucoou")

    event.preventDefault();
    let _imagePreview = imagePreview;
    setImagePreview("https://i.imgur.com/JuU08.gif");
    const reader = new FileReader();
    reader.onloadend = async () => {
      console.log("couc")
      const imageDataUrl = reader.result;
      const ipfsNode = createIPFSNode();
      const resp = await uploadIpfsImage(ipfsNode, imageDataUrl, true);
      const hash = keccak256(toUtf8Bytes(resp.path));
      console.log(hash)
      const assertResp = await assertImage(hash, resp.path as string);
      console.log(assertResp)

      if (!assertResp) {
        setImagePreview(_imagePreview);
        return;
      }
      // console.log("RESPONSE", resp);
      fetch(`https://image-dispute.infura-ipfs.io/ipfs/${resp.path}`, {
        method: "GET",
      })
        // fetch("https://image-dispute.infura-ipfs.io/ipfs/" + resp.path)
        .then((response) => {
          console.log(response);
          return response.text();
        })
        .then((data) => {
          setImagePreview(_imagePreview);
          setSelectedImage(data);
          setCid("coucou");
        });
    };

    reader.readAsDataURL(selectedImage);
  }

  function onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  return (
    <main className="relative flex h-screen w-screen flex-col items-center justify-between z-0">
      {selectedImage && !cid && (
        <div className="flex flex-col justify-center items-center h-screen gap-8 pt-12">
          <div
            className="flex items-center justify-center"
            style={{ width: "calc(100vw /3)", height: "calc(100vw /3)" }}
          >
            <SelectedImage
              setSelectedImage={setSelectedImage}
              selectedImage={imagePreview}
            />
          </div>
          <div className="flex flex-row gap-4">
            <button
              className="cursor-pointer flex w-full justify-center border-b border-gray-300 bg-gradient-to-b 
              from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30
              dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4
              lg:dark:bg-zinc-800/30 disabled:text-neutral-700 disabled:border-neutral-800 disabled:cursor-wait"
              disabled={
                imagePreview == "https://i.imgur.com/JuU08.gif" ? true : false
              }
            >
              <label className="">
                Change file
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden cursor-pointer disabled:cursor-wait"
                  onChange={onImageChange}
                  disabled={
                    imagePreview == "https://i.imgur.com/JuU08.gif"
                      ? true
                      : false
                  }
                />
              </label>
            </button>

            <button
              className="cursor-pointer flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 disabled:cursor-wait disabled:text-neutral-700 disabled:border-neutral-800"
              type="submit"
              onClick={onSubmit}
              disabled={
                imagePreview == "https://i.imgur.com/JuU08.gif" ? true : false
              }
            >
              Submit
            </button>
          </div>
        </div>
      )}
      {!selectedImage && !cid && (
        <div className="flex items-center justify-center h-screen flex-col">
          <div className="text-3xl font-bold">Upload your image</div>
          <div className="text-xl font-semibold mb-12">assert it's not AI generated, get challenged before it's settled</div>
          <div style={{ width: "calc(100vw /3)", height: "calc(100vw /3)" }}>
            <SelectImage onImageChange={onImageChange} />
          </div>
        </div>
      )}
      {cid && (
        <div className="flex flex-col justify-center items-center h-screen gap-4">
          <img
            alt={`Uploaded`}
            src={selectedImage}
            style={{ maxWidth: "400px", margin: "15px" }}
            // key={}
          />
          <div className="font-bold text-3xl">
            Congrats, let's wait to see if you have any disputes
          </div>
          <div>You can dispute other uploads</div>
          <div className="flex flex-row gap-3" onClick={() => setCid("")}>
            <button className="cursor-pointer flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
              Submit another file
            </button>
            <button className="cursor-pointer flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
              <Link href={"/vote"}>Vote</Link>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
