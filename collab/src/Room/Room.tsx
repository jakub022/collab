import { useParams } from "react-router";
import Chat from "./Chat";
import Toolbar from "./Toolbar";
import { Arrow, Line, Layer, Rect, Stage, Text } from "react-konva";
import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import type { InitMessage, ResetMessage, Shape, ShapeMessage, Tool, WSMessage } from "@/util/types";
import { v4 } from "uuid";

export default function Room(){

    let containerRef = useRef<HTMLDivElement | null>(null);
    let {roomId} = useParams();

    let [stageWidth, setStageWidth] = useState(0);
    let [stageHeight, setStageHeight] = useState(0);

    const [tool, setTool] = useState<Tool>("hand");
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    const [socket, setSocket] = useState<WebSocket | null>(null);

    const [username] = useState(() => `User#${Math.floor(Math.random() * 10000)}`);

    useEffect(()=>{
        if(!roomId){
            return;
        }

        const ws = new WebSocket(`/ws/${roomId}`);
        setSocket(ws);

        ws.onopen = ()=>{
            console.log("Connected to room: " + roomId);
        };
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data) as WSMessage;

            switch(msg.type){
                case "shape":
                    setShapes((prev)=>[...prev.filter((s)=>s.id !== msg.payload.id), msg.payload]);
                    break;
                case "reset":
                    setShapes([]);
                    break;
                case "chat":
                    break;
                case "init":
                    setShapes((msg as InitMessage).payload);
                    break;
                default:
                    break;
            }
        }
        ws.onclose = ()=>{
            console.log("Disconnected from room: " + roomId);
        };

        return ()=>{
            ws.close();
        };
    }, [roomId]);


    useEffect(() => {
        if(!containerRef.current){
            return;
        }
        setStageWidth(containerRef.current.offsetWidth)
        setStageHeight(containerRef.current.offsetHeight)
    }, []);

    function reset(){
        setShapes([]);
        socket?.send(JSON.stringify({type: "reset"} as ResetMessage));
    }

    function dragEndSimple(shape: { id: string }) {
        return (e: Konva.KonvaEventObject<DragEvent>) => {
            const node = e.target;
            const newX = node.x();
            const newY = node.y();

            setShapes((prev) =>
                prev.map((s) =>
                    s.id === shape.id ? { ...s, x: newX, y: newY } : s
                )
            );
            socket?.send(JSON.stringify({type: "shape", payload: { ...shape, x: newX, y: newY } } as ShapeMessage));
        };
    }

    function dragEndLine(shape: { id: string; points: number[] }) {
        return (e: Konva.KonvaEventObject<DragEvent>) => {
            const node = e.target;
            const dx = node.x();
            const dy = node.y();

            const newPoints = shape.points.map((p, i) => (i % 2 === 0 ? p + dx : p + dy));
            node.position({ x: 0, y: 0 });

            setShapes((prev) =>
                prev.map((s) =>
                    s.id === shape.id ? { ...s, points: newPoints } : s
                )
            );

            socket?.send(JSON.stringify({type: "shape", payload: { ...shape, points: newPoints }} as ShapeMessage));
        };
    }

    const shapeElements = shapes.map((shape)=>{
        switch (shape.type){
            case "square":
                return (
                    <Rect
                        key={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={120}
                        height={60}
                        cornerRadius={12}
                        fill="#bfdbfe"
                        stroke="#2563eb"
                        strokeWidth={3}
                        draggable={tool === "hand"}
                        onDragEnd={dragEndSimple(shape)}
                    />
                );
            case "text":
                return (
                    <Text
                        key={shape.id}
                        x={shape.x}
                        y={shape.y}
                        text={shape.text}
                        fontSize={18}
                        fontStyle="bold"
                        fill="#1e3a8a"
                        draggable={tool === "hand"}
                        onDragEnd={dragEndSimple(shape)}
                    />
                );
            case "pen":
                return (
                    <Line
                        key={shape.id}
                        points={shape.points}
                        stroke="#2563eb"
                        strokeWidth={3.5}
                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                        draggable={tool === "hand"}
                        onDragEnd={dragEndLine(shape)}
                    />
                );
            case "arrow":
                return (
                    <Arrow
                        key={shape.id}
                        points={shape.points}
                        stroke="#2563eb"
                        strokeWidth={3.5}
                        pointerLength={12}
                        pointerWidth={12}
                        draggable={tool === "hand"}
                        onDragEnd={dragEndLine(shape)}
                    />
                );
        }
    });

    function getPos(stage: Konva.Stage) {
        const pos = stage.getPointerPosition();
        if (!pos){
            return { x: 0, y: 0 };
        }
        else{
            return { x: pos.x, y: pos.y };
        }
    }

    function Grid({ width, height, cellSize }: { width: number; height: number; cellSize: number }) {
        const lines = [];
        for (let x = 0; x <= width; x += cellSize) {
            lines.push(
                <Line
                    key={`v-${x}`}
                    points={[x, 0, x, height]}
                    stroke="#D3D3D3"
                    strokeWidth={1}
                />
            );
        }
        for (let y = 0; y <= height; y += cellSize) {
            lines.push(
                <Line
                    key={`h-${y}`}
                    points={[0, y, width, y]}
                    stroke="#D3D3D3"
                    strokeWidth={1}
                />
            );
        }
        return <>{lines}</>;
    }

    return (
        <div ref={containerRef} className="relative w-full h-full">
            <Toolbar setTool={setTool} shapes={shapes} setShapes={setShapes} reset={reset} />
            <Stage
                width={stageWidth}
                height={stageHeight}
                onMouseDown={(e)=>{
                    const stage = e.target.getStage();
                    if (!stage) return;
                    const pos = getPos(stage);

                    let newShape: Shape | null = null

                    switch(tool){
                        case "square":
                            newShape = { id: v4(), type: "square", x: pos.x, y: pos.y };
                            break;
                        case "text":
                            let text = prompt("Enter text: ")
                            if(!text){
                                return;
                            }
                            newShape = { id: v4(), type: "text", x: pos.x, y: pos.y, text: text };
                            break;
                        case "pen":
                            setIsDrawing(true);
                            newShape = { id: v4(), type: "pen", points: [pos.x, pos.y]};
                            break;
                        case "arrow":
                            setIsDrawing(true);
                            newShape = { id: v4(), type: "arrow", points: [pos.x, pos.y]};
                            break;
                    }

                    if(newShape){
                        setShapes([...shapes, newShape]);
                        socket?.send(JSON.stringify({type: "shape", payload: newShape} as ShapeMessage));
                    }
                }}
                onMouseMove={(e)=>{
                    if (!isDrawing){
                        return;
                    } 
                    const stage = e.target.getStage();
                    if (!stage){
                        return;
                    }
                    const pos = getPos(stage);

                    setShapes((prev) => {
                        const last = prev[prev.length - 1];
                        if (!last){
                            return prev;
                        }

                        if (last.type === "pen") {
                            // new point
                            const updated = { ...last, points: [...last.points, pos.x, pos.y] };
                            const newShapes = [...prev.slice(0, -1), updated];
                            socket?.send(JSON.stringify({type: "shape", payload: updated} as ShapeMessage))
                            return newShapes;
                        }

                        if (last.type === "arrow") {
                            // end point
                            const updated = { ...last, points: [last.points[0], last.points[1], pos.x, pos.y] };
                            const newShapes = [...prev.slice(0, -1), updated];
                            socket?.send(JSON.stringify({type: "shape", payload: updated} as ShapeMessage))
                            return newShapes;
                        }

                        return prev;
                    });
                }}
                onMouseUp={()=>{
                    setIsDrawing(false);
                }}
                >
                <Layer>
                    <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill="#E5E4E2" />
                    <Grid width={stageWidth} height={stageHeight} cellSize={40}/>
                    {shapeElements}
                </Layer>
            </Stage>
            <Chat ws={socket} username={username} />
            <div className="absolute bottom-2 right-2 text-2xl dark:text-slate-900 text-slate-700 font-semibold">Room id: {roomId}</div>
        </div>
    );
}