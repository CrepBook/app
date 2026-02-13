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
    const [text, setText] = useState<string>("# Welcome\n## Cum Well\n\nStart writing...\n\nФормула: $E = mc^2$\n\n\n| Name | Score |\n|------|-------|\n| Ivan |  100  |\n| Max  |   95  |\n\n```py\nprint(1)\n```\n\n```cpp\nint main() {\n    return 1;\n}\n```\n");

    return (
        <div className="app-container">
            <FileEditor value={text} onChange={setText}/>
        </div>
    );
}
