import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Home(){

    const navigate = useNavigate();
    const [roomIdInput, setRoomIdInput] = useState("");

    async function createRoom(){
        try{
            const res = await fetch(`/api/rooms`, {
                method: "POST"
            });

            if(!res.ok){
                alert("Room creation failed on the backend.");
            }
            const data = await res.json();
            const roomId = data.room_id;
            navigate(`/room/${roomId}`);
        } catch(err){
            alert("Room creation failed: " + (err as Error).message);
        }
    }

    async function joinRoom(){
        if(!roomIdInput.trim()){
            alert("Enter a room ID");
            return;
        }

        try{
            const res = await fetch(`/api/rooms/${roomIdInput}`);
            if(!res.ok){
                alert("Room not found.");
                return;
            }
            navigate(`/room/${roomIdInput}`);
        } catch(err){
            alert("Room join failed: " + (err as Error).message);
        }
    }

    return (
        <div className="flex flex-row items-center h-full w-full">
            <div className="flex-1 items-center flex-grow">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-row gap-2">
                        <Input placeholder="Room id" value={roomIdInput} onChange={e=>setRoomIdInput(e.target.value)}/>
                        <Button onClick={joinRoom} variant="secondary">Join</Button>
                    </div>
                    <p>or</p>
                    <Button onClick={createRoom}>Create a new room</Button>
                </div>
            </div>
            <div className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center flex-grow h-full">
            </div>
        </div>
    );
}