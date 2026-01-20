export default function TableLoading() {
  return (
    <div className="flex flex-row gap-2 w-full">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-2 w-full">
          <div className="animate-pulse w-full bg-[#6c13137b] h-10 rounded-full"></div>
        </div>
        <div className="flex gap-2 w-full">
          <div className="animate-pulse w-full bg-gray-300 h-8 rounded-full"></div>
        </div>
        <div className="flex gap-2 w-full">
          <div className="animate-pulse w-full bg-gray-300 h-8 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
