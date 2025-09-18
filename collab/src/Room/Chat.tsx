import type { ChatMessage, Message, WSMessage } from "@/util/types";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

interface ChatProps {
    ws: WebSocket | null;
    username: string
};

export default function Chat({ws, username}: ChatProps){
    const [open, setOpen] = useState(true);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");

    useEffect(()=>{
        if(!ws){
            return;
        }

        function handleMessage(event: MessageEvent){
            try {
                const data = JSON.parse(event.data) as WSMessage;
                if(data.type === "chat"){
                    const msg: Message = data.payload;
                    setMessages(prev=>[...prev, msg]);
                }
            } catch(err){
                console.error("Invalid chat message recieved: ", err);
            }
        }
        ws.addEventListener("message", handleMessage);

        return ()=>{
            ws.removeEventListener("message", handleMessage);
        }
    }, [ws]);

    function sendMessage(){
        if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;
        const newMsg: Message = {
            id: v4(),
            text: input,
            username
        };
        setMessages(prev => [...prev, newMsg]);
        setInput("");

        ws.send(JSON.stringify({type: "chat", payload: newMsg} as ChatMessage))
    }

    const messageElements = messages.map((msg) => (<div key={msg.id} className={`p-2 rounded-lg w-max ${msg.username === username ? "bg-slate-200 dark:bg-slate-700 ml-auto" : "dark:bg-slate-700 bg-slate-200"}`}>{msg.username !== username && <div className="text-xs text-gray-600 dark:text-gray-400">{msg.username}</div>} {msg.text}</div>));

    return (
        <div className="absolute bottom-0 left-0 z-50">
            <div className={`transition-all duration-300 ease-in-out ${open ? "h-72" : "h-10"} w-80 shadow-xl border-t border-r rounded-tr-2xl flex flex-col bg-slate-50 dark:bg-slate-600`}>
                <div className="bg-slate-200 dark:bg-slate-900 px-4 py-2 text-sm font-medium cursor-pointer rounded-tr-2xl" onClick={() => setOpen(!open)}>
                    {open ? "▼ Hide Chat" : "▲ Show Chat"}
                </div>
                {open && (
                    <div className="flex flex-col h-full min-h-0">
                        <div className="flex-1 p-3 text-sm space-y-2 flex flex-col-reverse overflow-y-scroll">
                            {messageElements.slice().reverse()}
                        </div>
                        <div className="p-2 border-t flex gap-2">
                            <input value={input} onChange={e => setInput(e.target.value)} type="text" placeholder="Type a message..." className="flex-1 px-2 py-1 border rounded-lg text-sm focus:outline-none"/>
                            <button onClick={()=>sendMessage()} className="px-3 py-1 bg-slate-500 dark:bg-slate-900 text-white rounded-lg text-sm">Send</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}