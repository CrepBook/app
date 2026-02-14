use serde::Serialize;
use std::path::Path;

fn split_name_number(name: &str) -> (&str, u32) {
    let mut idx = name.len();
    for (i, ch) in name.char_indices().rev() {
        if ch.is_ascii_digit() {
            idx = i;
            continue;
        }
        idx = i + ch.len_utf8();
        break;
    }

    if idx < name.len() {
        let base = &name[..idx];
        let num = name[idx..].parse::<u32>().unwrap_or(0);
        return (base, num);
    }

    (name, 0)
}

fn next_available_dir_path(path: &Path) -> String {
    if !path.exists() {
        return path.to_string_lossy().into_owned();
    }

    let parent = path.parent().map(Path::to_path_buf).unwrap_or_default();
    let name = path.file_name().and_then(|s| s.to_str()).unwrap_or("Untitled");
    let (base, suffix) = split_name_number(name);

    let mut n: u32 = if suffix > 0 { suffix + 1 } else { 1 };
    loop {
        let candidate = parent.join(format!("{base}{n}"));
        if !candidate.exists() {
            return candidate.to_string_lossy().into_owned();
        }
        n += 1;
    }
}

#[derive(Serialize)]
pub struct DirContent {
    dirs: Vec<String>,
    files: Vec<String>,
}

#[tauri::command]
pub fn fs_get_dir_content(path: &str) -> DirContent {
    let mut dirs = Vec::new();
    let mut files = Vec::new();

    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            let full_path = entry_path.to_string_lossy().into_owned();

            if entry_path.is_dir() {
                dirs.push(full_path);
            } else {
                files.push(full_path);
            }
        }
    }

    DirContent { dirs, files }
}

#[tauri::command]
pub fn fs_create_dir(path: &str) -> bool {
    std::fs::create_dir(path).is_ok()
}

#[tauri::command]
pub fn fs_delete_dir(path: &str) -> bool {
    std::fs::remove_dir_all(path).is_ok()
}

#[tauri::command]
pub fn fs_is_dir_empty(path: &str) -> Result<bool, String> {
    let mut entries = std::fs::read_dir(path).map_err(|err| err.to_string())?;
    Ok(entries.next().is_none())
}

#[tauri::command]
pub fn fs_next_available_dir_path(path: &str) -> String {
    next_available_dir_path(Path::new(path))
}

#[tauri::command]
pub fn fs_rename_dir(old_path: &str, new_path: &str) -> bool {
    std::fs::rename(old_path, new_path).is_ok()
}
