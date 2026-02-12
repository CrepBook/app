import "./App.css";
import FileEditor from "./widgets/file-editor/ui/FileEditor.tsx"

// import { invoke } from "@tauri-apps/api/core";

function App() {
    // const [greetMsg, setGreetMsg] = useState("");
    // const [name, setName] = useState("");
    //
    // async function greet() {
    //     // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    //     setGreetMsg(await invoke("greet", { name }));
    // }

    return (
        <main className="container">
            <FileEditor />
        </main>
    );
}

export default App;
