export default function ChatBox() {
  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 overflow-y-auto">
        Messages
      </div>

      <input
        className="border p-2 rounded mt-2"
        placeholder="Type guess..."
      />

    </div>
  );
}