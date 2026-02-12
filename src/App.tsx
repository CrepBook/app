import "./App.css";
import {useState} from "react";
import {FileEditor} from "@/widgets/file-editor/ui/FileEditor";

// import { invoke } from "@tauri-apps/api/core";

function App() {
    // const [greetMsg, setGreetMsg] = useState("");
    // const [name, setName] = useState("");
    //
    // async function greet() {
    //     // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    //     setGreetMsg(await invoke("greet", { name }));
    // }

    const [text, setText] = useState<string>("# Hello\n\nWrite markdown here...");

    return (
        <main className="container">
            <FileEditor value={text} onChange={setText}/>
        </main>
    );
}

export default App;
