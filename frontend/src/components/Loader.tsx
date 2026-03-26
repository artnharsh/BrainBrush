export default function Loader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="flex gap-2">
        <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-black animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-black animate-bounce"></div>
      </div>
      <p className="font-black text-gray-700 tracking-widest uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}