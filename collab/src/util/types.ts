export type Tool = "hand" | "pen" | "text" | "arrow" | "square";

export type Shape = { id: string; type: "square"; x: number; y: number} 
    | { id: string; type: "text"; x: number; y: number; text: string }
    | { id: string; type: "pen"; points: number[] }
    | { id: string; type: "arrow"; points: number[] };

export type Message = {id: string, text: string, username: string}