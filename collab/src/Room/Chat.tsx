import type { Message } from "@/util/types";
import { useState } from "react";

export default function Chat(){
    const [open, setOpen] = useState(true);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const username = "testuser";

    const messageElements = messages.map((msg) => (<div key={msg.id} className={`p-2 rounded-lg w-max ${msg.username === username ? "bg-blue-200 ml-auto" : "bg-gray-200"}`}>{msg.username !== username && <div className="text-xs text-gray-600">{msg.username}</div>} {msg.text}</div>));

    function sendMessage(){
        if (!input.trim()) return;
        const newMsg: Message = {
            id: crypto.randomUUID(),
            text: input,
            username
        };
        setMessages(prev => [...prev, newMsg]);
        setInput("");
    }

    return (
        <div className="absolute bottom-0 left-0 z-50">
            <div className={`transition-all duration-300 ease-in-out ${open ? "h-72" : "h-10"} w-80 bg-white shadow-xl border-t border-r rounded-tr-2xl flex flex-col`}>
                <div className="px-4 py-2 bg-gray-800 text-white text-sm font-medium cursor-pointer rounded-tr-2xl" onClick={() => setOpen(!open)}>
                    {open ? "▼ Hide Chat" : "▲ Show Chat"}
                </div>
                {open && (
                    <div>
                        <div className="flex-1 p-3 overflow-y-auto text-sm space-y-2">
                            {messageElements}
                        </div>
                        <div className="p-2 border-t flex gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 px-2 py-1 border rounded-lg text-sm focus:outline-none"
                            />
                            <button onClick={()=>sendMessage()} className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm">Send</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}