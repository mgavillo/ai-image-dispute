import { useEffect, useRef, useState } from "react";
import { BsCheckLg } from "react-icons/bs";
import { getIpfsImage } from "../../utils/ipfs";
import { ethers } from "ethers";
import ooAbi from "../abis/OOV3.json";

export default function Notification({
  imageUrl,
  resolved,
  id,
  seen,
}: {
  imageUrl: string;
  resolved: boolean;
  id: string;
  seen: boolean;
}) {
  const [imageData, setImageData] = useState<string>();
  const [signer, setSigner] = useState(
    new ethers.providers.Web3Provider(window.ethereum as any).getSigner()
  );

  const [oo, setOo] = useState(
    new ethers.Contract(
      "0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB",
      ooAbi,
      signer
    )
  );

  useEffect(() => {
    const fetchData = async () => {
      const _imageData = await getIpfsImage(imageUrl);
      setImageData(_imageData);
    };
    fetchData();

    //@ts-ignore
    window.ethereum.on("accountsChanged", async function () {
      setSigner(
        new ethers.providers.Web3Provider(window.ethereum as any).getSigner()
      );
    });
    if (!seen) {
      try {
        const fetching = async () => {
          console.log("beginning of fetch");
          const resp = await fetch(
            "https://stark-sea-51933.herokuapp.com/api/notifications",
            { method: "POST", body: JSON.stringify({"assertionId": id}) }
          );
        };
        fetching();
      } catch (error) {
        console.log("API fetch error", error);
      }
    }
  }, []);

  async function settleAssertion(assertionId: string) {
    try {
      const tx = await oo.settleAssertion(assertionId);
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

  return (
    <div className=" w-64 h-24 p-3 rounded-md flex flex-row gap-2 hover:bg-neutral-800">
      <img className="rounded-full w-16 h-16 object-cover" src={imageData} />
      <div className="flex flex-col text-left ">
        <p className=" text-sm">Your file has not been disputed</p>
        {!resolved && (
          <button onClick={() => settleAssertion(id)}>Resolve</button>
        )}
        {/* <p className="text-xs italic text-neutral-500">2 days ago</p> */}
      </div>
    </div>
  );
}
