export default function HumanOrAi({onHumanClick, onAIClick}:{onHumanClick:any, onAIClick: any}) {
  return (
    <div className="flex flex-row p-4 gap-4">
      <div
        className="text-2xl cursor-pointer fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
        onClick={onAIClick}
      >
        🤖 AI
      </div>
      <div
        className="text-2xl cursor-pointer fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
        onClick={onHumanClick}
      >
        😄 Human
      </div>
    </div>
  );
}
