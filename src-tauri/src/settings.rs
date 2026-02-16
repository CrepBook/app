use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

const SETTINGS_FILE: &str = ".crepbook.settings.json";

fn default_root_path() -> String {
    "".to_string()
}

fn default_autosave_ms() -> u64 {
    10_000
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    #[serde(default = "default_root_path")]
    pub default_root_path: String,
    #[serde(default = "default_autosave_ms")]
    pub autosave_ms: u64,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            default_root_path: default_root_path(),
            autosave_ms: default_autosave_ms(),
        }
    }
}

impl AppSettings {
    fn settings_path(app_handle: &tauri::AppHandle) -> PathBuf {
        app_handle
            .path()
            .app_config_dir()
            .expect("failed to get config dir")
            .join(SETTINGS_FILE)
    }

    pub fn load(app_handle: &tauri::AppHandle) -> Self {
        let path = Self::settings_path(app_handle);

        if let Ok(content) = fs::read_to_string(&path)
            && let Ok(settings) = serde_json::from_str::<AppSettings>(&content)
        {
            return settings;
        }

        let default = AppSettings::default();
        let _ = default.save(app_handle);
        default
    }

    pub fn save(&self, app_handle: &tauri::AppHandle) -> Result<(), String> {
        let path = Self::settings_path(app_handle);

        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }

        let content = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        fs::write(&path, content).map_err(|e| e.to_string())?;
        Ok(())
    }
}

pub struct SettingsState {
    settings: Mutex<AppSettings>,
}

impl SettingsState {
    pub fn new(app_handle: &tauri::AppHandle) -> Self {
        Self {
            settings: Mutex::new(AppSettings::load(app_handle)),
        }
    }

    fn with_settings<F, R>(&self, f: F) -> Result<R, String>
    where
        F: FnOnce(&AppSettings) -> R,
    {
        let settings = self.settings.lock().map_err(|e| e.to_string())?;
        Ok(f(&settings))
    }

    fn with_settings_mut<F, R>(&self, app_handle: &tauri::AppHandle, f: F) -> Result<R, String>
    where
        F: FnOnce(&mut AppSettings) -> R,
    {
        let mut settings = self.settings.lock().map_err(|e| e.to_string())?;
        let result = f(&mut settings);
        settings.save(app_handle)?;
        Ok(result)
    }
}

#[tauri::command]
pub fn settings_get_default_root_path(
    state: tauri::State<SettingsState>,
) -> Result<String, String> {
    state.with_settings(|s| s.default_root_path.clone())
}

#[tauri::command]
pub fn settings_set_default_root_path(
    app_handle: tauri::AppHandle,
    state: tauri::State<SettingsState>,
    path: String,
) -> Result<(), String> {
    state.with_settings_mut(&app_handle, |s| s.default_root_path = path)
}

#[tauri::command]
pub fn settings_get_autosave_ms(state: tauri::State<SettingsState>) -> Result<u64, String> {
    state.with_settings(|s| s.autosave_ms)
}

#[tauri::command]
pub fn settings_set_autosave_ms(
    app_handle: tauri::AppHandle,
    state: tauri::State<SettingsState>,
    ms: u64,
) -> Result<(), String> {
    state.with_settings_mut(&app_handle, |s| s.autosave_ms = ms)
}

#[tauri::command]
pub fn settings_get_all(state: tauri::State<SettingsState>) -> Result<AppSettings, String> {
    state.with_settings(|s| s.clone())
}

#[tauri::command]
pub fn settings_reset_to_defaults(app_handle: tauri::AppHandle) -> Result<(), String> {
    let settings_path = AppSettings::settings_path(&app_handle);
    if settings_path.exists() {
        fs::remove_file(&settings_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_settings_default() {
        let settings = AppSettings::default();
        assert_eq!(settings.default_root_path, "");
        assert_eq!(settings.autosave_ms, 10_000);
    }

    #[test]
    fn test_app_settings_serialize() {
        let settings = AppSettings {
            default_root_path: "/test/path".to_string(),
            autosave_ms: 5000,
        };

        let json = serde_json::to_string(&settings).unwrap();
        assert!(json.contains("/test/path"));
        assert!(json.contains("5000"));
    }

    #[test]
    fn test_app_settings_deserialize() {
        let json = r#"{"default_root_path": "/my/path", "autosave_ms": 3000}"#;
        let settings: AppSettings = serde_json::from_str(json).unwrap();

        assert_eq!(settings.default_root_path, "/my/path");
        assert_eq!(settings.autosave_ms, 3000);
    }

    #[test]
    fn test_app_settings_deserialize_defaults() {
        let json = r#"{}"#;
        let settings: AppSettings = serde_json::from_str(json).unwrap();

        assert_eq!(settings.default_root_path, "");
        assert_eq!(settings.autosave_ms, 10_000);
    }

    #[test]
    fn test_app_settings_clone() {
        let settings = AppSettings {
            default_root_path: "/path".to_string(),
            autosave_ms: 15000,
        };
        let cloned = settings.clone();

        assert_eq!(cloned.default_root_path, settings.default_root_path);
        assert_eq!(cloned.autosave_ms, settings.autosave_ms);
    }

    #[test]
    fn test_app_settings_debug() {
        let settings = AppSettings::default();
        let debug_str = format!("{:?}", settings);

        assert!(debug_str.contains("AppSettings"));
        assert!(debug_str.contains("default_root_path"));
        assert!(debug_str.contains("autosave_ms"));
    }
}
