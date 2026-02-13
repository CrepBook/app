import React, {useMemo} from "react";
import "./FileNameInput.css";

const MAX_NAME_LENGTH = 127;

type FileNameInputProps = {
    value: string;
    onChange: (nextFullName: string) => void;
    onCommit?: (nextFullName: string) => void;

    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

function splitExt(name: string) {
    const lastDot = name.lastIndexOf(".");
    if (lastDot <= 0) {
        return {base: name, ext: ""};
    }
    return {base: name.slice(0, lastDot), ext: name.slice(lastDot)};
}

export default function FileNameInput(
    {
        value,
        onChange,
        onCommit,
        placeholder = "untitled",
        disabled,
        className,
    }: FileNameInputProps
) {
    const {base, ext} = useMemo(() => splitExt(value), [value]);
    const isMd = ext.toLowerCase() === ".md";

    const displayValue = isMd ? base : value;

    const clamp = (s: string) => s.slice(0, MAX_NAME_LENGTH);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = clamp(e.target.value);

        if (isMd) {
            if (raw.includes(".")) {
                onChange(raw);
            } else {
                onChange(`${raw}.md`);
            }
            return;
        }

        onChange(raw);
    };

    const handleBlur = () => {
        let curr = value;

        if (isMd) {
            const {base: currBase} = splitExt(curr);
            const fixedBase = currBase.trimEnd().slice(0, MAX_NAME_LENGTH);
            curr = `${fixedBase}.md`;
        } else {
            curr = curr.trimEnd().slice(0, MAX_NAME_LENGTH);
        }

        if (curr !== value) onChange(curr);
        onCommit?.(curr);
    };

    return (
        <input
            className={`file-name-input ${className ?? ""}`}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={MAX_NAME_LENGTH}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
        />
    );
}
