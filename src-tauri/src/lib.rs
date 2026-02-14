mod fs_wrapper {
    pub mod dirs;
    pub mod files;
}

pub mod settings;

use fs_wrapper::dirs::*;
use fs_wrapper::files::*;
use settings::*;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(SettingsState::new(&app.handle()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            fs_file_exist,
            fs_read_file,
            fs_write_file,
            fs_create_file,
            fs_delete_file,
            fs_is_file_empty,
            fs_next_available_file_path,
            fs_rename_file,
            fs_get_dir_content,
            fs_create_dir,
            fs_delete_dir,
            fs_is_dir_empty,
            fs_next_available_dir_path,
            fs_rename_dir,
            settings_get_default_root_path,
            settings_set_default_root_path,
            settings_get_autosave_ms,
            settings_set_autosave_ms,
            settings_get_all,
            settings_reset_to_defaults
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
