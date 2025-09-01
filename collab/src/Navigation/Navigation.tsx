import { Link, Outlet } from "react-router";
import ThemeToggle from "./ThemeToggle";

export default function Navigation(){
    return (
        <div className="flex flex-col h-screen">
            <div className="flex m-4 justify-between">
                <Link to="/"><h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Live Collab</h4></Link>
                <div className="flex gap-2">
                    <ThemeToggle />
                </div>
            </div>
            <div className="flex-1 flex">
                <Outlet/>
            </div>
        </div>
    );
}