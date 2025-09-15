import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";

export default function Home(){
    return (
        <div className="flex flex-row items-center h-full w-full">
            <div className="flex-1 items-center flex-grow">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-row gap-2">
                        <Input placeholder="Room id"/>
                        <Button variant="secondary">Join</Button>
                    </div>
                    <p>or</p>
                    <Link to="/room/1"><Button>Create a new room</Button></Link>
                </div>
            </div>
            <div className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center flex-grow h-full">
            </div>
        </div>
    );
}