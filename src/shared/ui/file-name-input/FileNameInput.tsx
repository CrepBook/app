import React, {useEffect, useMemo, useRef} from "react";
import "./FileNameInput.css";

const MAX_NAME_LENGTH = 127;

type FileNameInputProps = {
    value: string;
    onChange: (nextFullName: string) => void;
    onCommit?: (nextFullName: string) => void;

    placeholder?: string;
    disabled?: boolean;
    className?: string;
    focusToken?: number;
};

function splitExt(name: string) {
    const trimmed = name.trimEnd();
    const mdMatch = trimmed.match(/^(.*)\.md$/i);
    if (mdMatch) {
        return {base: mdMatch[1], ext: ".md"};
    }

    const lastDot = trimmed.lastIndexOf(".");
    if (lastDot <= 0) {
        return {base: trimmed, ext: ""};
    }
    return {base: trimmed.slice(0, lastDot), ext: trimmed.slice(lastDot)};
}

export default function FileNameInput(
    {
        value,
        onChange,
        onCommit,
        placeholder = "untitled",
        disabled,
        className,
        focusToken = 0,
    }: FileNameInputProps
) {
    const inputRef = useRef<HTMLInputElement>(null);
    const {base, ext} = useMemo(() => splitExt(value), [value]);
    const isMd = ext.toLowerCase() === ".md";

    const displayValue = isMd ? base : value;

    const clamp = (s: string) => s.slice(0, MAX_NAME_LENGTH);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = clamp(e.target.value);

        if (isMd) {
            const nextBase = raw.replace(/\.md$/i, "");
            onChange(`${nextBase}.md`);
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

    useEffect(() => {
        if (disabled) {
            return;
        }

        if (!inputRef.current) {
            return;
        }

        inputRef.current.focus();
        inputRef.current.select();
    }, [disabled, focusToken]);

    return (
        <input
            ref={inputRef}
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
