use std::path::{Path, PathBuf};

fn split_stem_number(stem: &str) -> (&str, u32) {
    let mut idx = stem.len();
    for (i, ch) in stem.char_indices().rev() {
        if ch.is_ascii_digit() {
            idx = i;
            continue;
        }
        idx = i + ch.len_utf8();
        break;
    }

    if idx < stem.len() {
        let base = &stem[..idx];
        let num = stem[idx..].parse::<u32>().unwrap_or(0);
        return (base, num);
    }

    (stem, 0)
}

fn next_available_path(path: &Path) -> PathBuf {
    if !path.exists() {
        return path.to_path_buf();
    }

    let parent = path.parent().map(Path::to_path_buf).unwrap_or_default();
    let stem = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("file");
    let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("");
    let (base, suffix) = split_stem_number(stem);

    let mut n: u32 = if suffix > 0 { suffix + 1 } else { 1 };
    loop {
        let candidate_name = if ext.is_empty() {
            format!("{base}{n}")
        } else {
            format!("{base}{n}.{ext}")
        };
        let candidate = parent.join(candidate_name);
        if !candidate.exists() {
            return candidate;
        }
        n += 1;
    }
}

#[tauri::command]
pub fn fs_file_exist(filename: &str) -> bool {
    std::fs::File::open(filename).is_ok()
}

#[tauri::command]
pub fn fs_read_file(filename: &str) -> Result<String, String> {
    std::fs::read_to_string(filename).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn fs_write_file(filename: &str, content: String) -> bool {
    std::fs::write(filename, content).is_ok()
}

#[tauri::command]
pub fn fs_create_file(filename: &str) -> bool {
    std::fs::File::create(filename).is_ok()
}

#[tauri::command]
pub fn fs_delete_file(filename: &str) -> Result<(), String> {
    std::fs::remove_file(filename).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn fs_is_file_empty(filename: &str) -> Result<bool, String> {
    let metadata = std::fs::metadata(filename).map_err(|err| err.to_string())?;
    Ok(metadata.len() == 0)
}

#[tauri::command]
pub fn fs_next_available_file_path(filename: &str) -> String {
    let desired_path = Path::new(filename);
    next_available_path(desired_path).to_string_lossy().into_owned()
}

#[tauri::command]
pub fn fs_rename_file(old_filename: &str, new_filename: &str) -> Result<String, String> {
    let old_path = Path::new(old_filename);
    let desired_path = Path::new(new_filename);

    if old_path == desired_path {
        return Ok(old_filename.to_string());
    }

    let target_path = next_available_path(desired_path);
    std::fs::rename(old_path, &target_path)
        .map_err(|err| err.to_string())?;

    Ok(target_path.to_string_lossy().into_owned())
}
