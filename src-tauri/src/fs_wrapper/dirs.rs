#[tauri::command]
pub fn fs_get_dir_content(path: &str) -> Vec<String> {
    let mut content = Vec::new();
    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries {
            if let Ok(entry) = entry {
                content.push(entry.path().to_string_lossy().into_owned());
            }
        }
    }
    content
}

#[tauri::command]
pub fn fs_create_dir(path: &str) -> bool {
    std::fs::create_dir(path).is_ok()
}

#[tauri::command]
pub fn fs_delete_dir(path: &str) -> bool {
    std::fs::remove_dir(path).is_ok()
}

#[tauri::command]
pub fn fs_rename_dir(old_path: &str, new_path: &str) -> bool {
    std::fs::rename(old_path, new_path).is_ok()
}
