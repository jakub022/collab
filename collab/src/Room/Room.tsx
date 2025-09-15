import { useParams } from "react-router";
import Chat from "./Chat";
import Toolbar from "./Toolbar";
import { Arrow, Line, Layer, Rect, Stage, Text } from "react-konva";
import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import type { Shape, Tool } from "@/util/types";

export default function Room(){

    let containerRef = useRef<HTMLDivElement | null>(null);
    let {roomId} = useParams();

    let [stageWidth, setStageWidth] = useState(0);
    let [stageHeight, setStageHeight] = useState(0);

    const [tool, setTool] = useState<Tool>("hand");
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if(!containerRef.current){
            return;
        }
        setStageWidth(containerRef.current.offsetWidth)
        setStageHeight(containerRef.current.offsetHeight)
    }, []);

    const shapeElements = shapes.map((shape)=>{
        switch (shape.type){
            case "square":
                return (
                    <Rect
                        key={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={50}
                        height={50}
                        fill="black"
                        draggable={tool === "hand"}
                    />
                );
            case "text":
                return (
                    <Text
                        key={shape.id}
                        x={shape.x}
                        y={shape.y}
                        text={shape.text}
                        fontSize={16}
                        draggable={tool === "hand"}
                    />
                );
            case "pen":
                return (
                    <Line
                        key={shape.id}
                        points={shape.points}
                        stroke="black"
                        strokeWidth={2}
                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                    />
                );
            case "arrow":
                return (
                    <Arrow
                        key={shape.id}
                        points={shape.points}
                        stroke="black"
                        strokeWidth={2}
                        pointerLength={10}
                        pointerWidth={10}
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

    return (
        <div ref={containerRef} className="relative w-full h-full">
            <Toolbar setTool={setTool} shapes={shapes} setShapes={setShapes} />
            <Stage
                width={stageWidth}
                height={stageHeight}
                onMouseDown={(e)=>{
                    const stage = e.target.getStage();
                    if (!stage) return;
                    const pos = getPos(stage);

                    switch(tool){
                        case "square":
                            setShapes([...shapes, { id: crypto.randomUUID(), type: "square", x: pos.x, y: pos.y }]);
                            break;
                        case "text":
                            setShapes([...shapes, { id: crypto.randomUUID(), type: "text", x: pos.x, y: pos.y, text: "TEXT" }]);
                            break;
                        case "pen":
                            setIsDrawing(true);
                            setShapes([...shapes, { id: crypto.randomUUID(), type: "pen", points: [pos.x, pos.y]}]);
                            break;
                        case "arrow":
                            setIsDrawing(true);
                            setShapes([...shapes,{ id: crypto.randomUUID(), type: "arrow", points: [pos.x, pos.y]}]);
                            break;
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
                            // Add new point
                            const updated = { ...last, points: [...last.points, pos.x, pos.y] };
                            return [...prev.slice(0, -1), updated];
                        }

                        if (last.type === "arrow") {
                            // Update end point only
                            const updated = { ...last, points: [last.points[0], last.points[1], pos.x, pos.y] };
                            return [...prev.slice(0, -1), updated];
                        }

                        return prev;
                    });
                }}
                onMouseUp={()=>{
                    setIsDrawing(false);
                }}
                >
                <Layer>
                    <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill="white" />
                    {shapeElements}
                </Layer>
            </Stage>
            <Chat />
        </div>
    );
}