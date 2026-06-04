export function LoadingRows() {
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center gap-4">
      <div className="flex gap-2">
        <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce" />
        <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-[#F25B29] rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <p className="text-gray-500 text-sm">Data laden...</p>
    </div>
  );
}