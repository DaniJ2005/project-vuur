export function LoadingRows() {
  return (
    <div className="pt-16 min-h-[220px] flex items-center justify-center bg-[#111] rounded-b-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-gray-400 text-sm">Data laden...</p>
      </div>
    </div>
  );
}
