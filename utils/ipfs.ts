import  { create } from "ipfs-http-client";

export function createIPFSNode() {
  if(!process.env.projectId || !process.env.projectSecret) return
  // return create();
  return create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: `Basic ${window.btoa(process.env.projectId + ":" + process.env.projectSecret)}`
    }

  });
}

export const uploadIpfsImage = (ipfsNode: any, data: any, pin: boolean) => {
  return ipfsNode.add(data, false);
};

export const getIpfsImage = async (url: string) => {
  try {
    console.log("getIPFSImage");
    const resp = await fetch(
      `https://image-dispute.infura-ipfs.io/ipfs/${url}`,
      {
        method: "GET",
      }
    );
    console.log("get RESP IPFSImage");

    const respText = await resp.text();
    console.log("get TEXT IPFSImage");

    return respText;
  } catch (error) {
    console.log("Ipfs fetch error : ", error);
  }
};