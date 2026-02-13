import "./styles/globals.css";
import "./styles/layout.css";
import "./styles/tokens.css";

import {useState} from "react";
import {FileEditor} from "@/widgets/file-editor/ui/FileEditor";

// import { invoke } from "@tauri-apps/api/core";

export default function App() {
    // const [greetMsg, setGreetMsg] = useState("");
    // const [name, setName] = useState("");
    //
    // async function greet() {
    //     // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    //     setGreetMsg(await invoke("greet", { name }));
    // }
    const [text, setText] = useState<string>("# Welcome\n\nStart writing...");

    return (
        <div className="app-container">
            <FileEditor value={text} onChange={setText}/>
        </div>
    );
}
