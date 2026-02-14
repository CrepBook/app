export function joinPath(dir: string, name: string) {
    const separator = dir.includes("\\") ? "\\" : "/";
    return `${dir}${separator}${name}`;
}

export function entryName(path: string) {
    return path.split(/[/\\]/).filter(Boolean).pop() ?? path;
}

export function parentDir(path: string) {
    const slashIndex = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
    return slashIndex > 0 ? path.slice(0, slashIndex) : "";
}

export function withCounter(name: string, n: number) {
    const dot = name.lastIndexOf(".");
    if (dot > 0) {
        return `${name.slice(0, dot)}${n}${name.slice(dot)}`;
    }
    return `${name}${n}`;
}

export function remapPath(value: string, fromPath: string, toPath: string) {
    if (value === fromPath) {
        return toPath;
    }

    if (value.startsWith(`${fromPath}/`) || value.startsWith(`${fromPath}\\`)) {
        return `${toPath}${value.slice(fromPath.length)}`;
    }

    return value;
}

export function isPathInside(path: string, parent: string) {
    return path === parent || path.startsWith(`${parent}/`) || path.startsWith(`${parent}\\`);
}
