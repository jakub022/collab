import { Button } from "@/components/ui/button";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import type { Shape, Tool } from "@/util/types";
import { ArrowBigLeft, Download, Hand, Pen, Square, Trash, Type, Upload } from "lucide-react";
import { useRef } from "react";

interface ToolbarProps {
    shapes: Shape[],
    setShapes: (shapes: Shape[]) => void,
    setTool: (tool: Tool)=> void,
    reset: () => void
}

export default function Toolbar( { setTool, shapes, setShapes, reset } : ToolbarProps){

    const fileInputRef = useRef<HTMLInputElement>(null);

    function download() {
        const dataStr = JSON.stringify(shapes, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "room.json";
        a.click();

        URL.revokeObjectURL(url);
    }

    function upload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (Array.isArray(json)) {
                    setShapes(json);
                } else {
                    alert("Invalid JSON");
                }
            } catch (err) {
                alert("Error parsing JSON");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    }

    return (
        <div className="p-3 absolute z-10 flex flex-row justify-between w-full">
            <div className="flex flex-row gap-1">
                <Button onClick={()=>download()} variant="secondary"><Download/></Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary"><Upload/></Button>
                <input type="file" accept=".json" ref={fileInputRef} style={{ display: "none" }} onChange={upload}/>
                <Button onClick={()=>reset()} variant="secondary"><Trash/></Button>
            </div>
            <div className="flex flex-row gap-1">
                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger onClick={()=>setTool("hand")}><Hand/></MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger onClick={()=>setTool("pen")}><Pen/></MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger onClick={()=>setTool("text")}><Type/></MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger onClick={()=>setTool("arrow")}><ArrowBigLeft/></MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger onClick={()=>setTool("square")}><Square/></MenubarTrigger>
                    </MenubarMenu>
                </Menubar>
            </div>
        </div>
    );
}