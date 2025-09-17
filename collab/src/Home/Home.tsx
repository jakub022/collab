import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pen } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Home() {

    const navigate = useNavigate();
    const [roomIdInput, setRoomIdInput] = useState("");

    async function createRoom() {
        try {
            const res = await fetch(`/api/rooms`, {
                method: "POST"
            });

            if (!res.ok) {
                alert("Room creation failed on the backend.");
            }
            const data = await res.json();
            const roomId = data.room_id;
            navigate(`/room/${roomId}`);
        } catch (err) {
            alert("Room creation failed: " + (err as Error).message);
        }
    }

    async function joinRoom() {
        if (!roomIdInput.trim()) {
            alert("Enter a room ID");
            return;
        }

        try {
            const res = await fetch(`/api/rooms/${roomIdInput}`);
            if (!res.ok) {
                alert("Room not found.");
                return;
            }
            navigate(`/room/${roomIdInput}`);
        } catch (err) {
            alert("Room join failed: " + (err as Error).message);
        }
    }

    return (
        <div className="flex flex-row items-center h-full w-full">
            <div className="flex-1 items-center flex-grow">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-row gap-2">
                        <Input placeholder="Room id" value={roomIdInput} onChange={e => setRoomIdInput(e.target.value)} />
                        <Button onClick={joinRoom} variant="secondary">Join</Button>
                    </div>
                    <p>or</p>
                    <Button onClick={createRoom}>Create a new room</Button>
                </div>
            </div>
            <div className="flex-1 bg-gradient-to-r dark:from-purple-500 dark:via-pink-500 dark:to-red-500 from-emerald-300 via-teal-200 to-sky-300 flex items-center justify-center flex-grow h-full flex-col gap-2">
                <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
                    Sketch out ideas with others🖊️
                </h1>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    A collaborative whiteboard with real-time chat for simple, fast teamwork.
                </h4>
            </div>
        </div>
    );
}