import CodeMirror from "@uiw/react-codemirror";
import {EditorView} from "@codemirror/view";
import {markdown} from "@codemirror/lang-markdown";
import {oneDark} from "@codemirror/theme-one-dark";

type FileContentEditorProps = {
    value: string;
    onChange: (value: string) => void;
    name?: string;
    placeholder?: string;
    disabled?: boolean;
};

export default function FileContentEditor(
    {
        value,
        onChange,
        placeholder = "Write markdown...",
        disabled,
    }: FileContentEditorProps
) {
    return (
        <div style={{height: "100dvh"}}>
            <CodeMirror
                value={value}
                height="100%"
                editable={!disabled}
                placeholder={placeholder}
                theme={oneDark}
                extensions={[
                    markdown(),
                    EditorView.lineWrapping,
                ]}
                onChange={(val) => onChange(val)}
                onBlur={() => console.log("Textarea content:", value)}
            />
        </div>
    );
}
