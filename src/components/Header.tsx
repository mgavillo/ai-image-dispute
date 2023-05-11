"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import Link from "next/link";
import { IoMdNotifications } from "react-icons/io";
import Notification from "./Notification";
export default function Header() {
  const [unseenNotifs, setUnseenNotifs] = useState<any[]>([]);
  const { connect, connectors } = useConnect();
  const { address, isConnected, isConnecting } = useAccount();
  const [notificationPannel, toggleNotificationPannel] = useState<boolean>();
  useEffect(() => {
    console.log(address);
  }, [address]);

  useEffect(() => {
    // if(!isConnected) return
    try {
      const fetching = async () => {
        console.log(
          `https://stark-sea-51933.herokuapp.com/api/notifications/${address?.toLowerCase()}`
        );
        const resp = await fetch(
          `https://stark-sea-51933.herokuapp.com/api/notifications/${address?.toLowerCase()}`,
          {
            method: "GET",
          }
        );
        const jsonResp = await resp.json();
        console.log("json", jsonResp);
        let notifs = jsonResp.data?.filter(
          (notification: any) => !notification.Seen
        );
        setUnseenNotifs(notifs);
        // console.log("notifs", notifications.current);
        // console.log("notifs", unSeenNotifications.current);
      };
      fetching();
      // const checkClicked = (event: any) => {
      //   if (event.target.id !== "notifButton") {
      //     console.log("ttoglkke", event.target.id);

      //     toggleNotificationPannel(false);
      //   } else {
      //     console.log("ttogle");
      //     toggleNotificationPannel(!notificationPannel);
      //     event.stopPropagation();
      //   }
      // };
      // window.addEventListener("click", checkClicked);
      // return () => {
      //   window.removeEventListener("click", checkClicked);
      // };
    } catch (error) {
      console.log("API fetch error", error);
    }
  }, []);

  const handleOnPannelClick = (e: any) => {
    e.stopPropagation();
  };
  // console.log("NOTIFS", notifications.current);
  return (
    <div className="absolute w-screen px-12 h-24 flex flex-row justify-between items-center z-40">
      <ul className="flex flex-row gap-3 font-bold text-lg">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/vote">Vote</Link>
        </li>
        <li>
          <Link href="/gallery">Gallery</Link>
        </li>
      </ul>

      <div className="flex flex-row gap-3">
        <button
          className="cursor-pointer fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
          onClick={() => connect({ connector: connectors[0] })}
        >
          {isConnecting && "Connecting ..."}
          {isConnected &&
            !isConnecting &&
            address &&
            address.slice(0, 4) + "..." + address?.slice(address.length - 4)}
          {!isConnected && !isConnecting && "Connect wallet"}
        </button>
        <button
          id="notifButton"
          className="relative cursor-pointer left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
          onClick={() => toggleNotificationPannel(!notificationPannel)}
        >
          <IoMdNotifications size={30} />
          {unseenNotifs && unseenNotifs.length !== 0 && (
            <div className="absolute bg-red-600 rounded-full h-4 w-4 top-3 right-3 text-xs">
              {unseenNotifs.length}
            </div>
          )}
          {notificationPannel && (
            <div
              className="absolute top-full mt-2 right-0 w-fit min-w-[300px] h-[400px] bg-neutral-900 rounded-md px-4 py-3 flex flex-col gap-2 overflow-x-scroll"
              onClick={(e) => handleOnPannelClick(e)}
            >
              {unseenNotifs?.map((e, i) => {
                return (
                  <Notification
                    imageUrl={e.ImageUrl}
                    resolved={e.Resolved}
                    id={e.AssertionId}
                    seen={e.Seen}
                  />
                );
              })}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
