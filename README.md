# Client APP

## Contributing
See our guidelines: https://github.com/CrepBook/.github/blob/main/CONTRIBUTING.md


## Good file structure

```
app/
├── backend/                      # 🦀 Rust Backend
│   ├── src/
│   │   ├── commands/             # Tauri commands (IPC handlers)
│   │   │   ├── mod.rs
│   │   │   ├── file_commands.rs
│   │   │   └── system_commands.rs
│   │   │
│   │   ├── services/             # Business logic
│   │   │   ├── mod.rs
│   │   │   ├── database.rs
│   │   │   └── file_service.rs
│   │   │
│   │   ├── models/               # Data structures
│   │   │   ├── mod.rs
│   │   │   └── app_state.rs
│   │   │
│   │   ├── utils/                # Helper functions
│   │   │   ├── mod.rs
│   │   │   └── helpers.rs
│   │   │
│   │   ├── lib.rs                # Library exports
│   │   └── main.rs               # Application entry point
│   │
│   ├── icons/                    # App icons
│   ├── Cargo.toml                # Rust dependencies
│   ├── Cargo.lock
│   ├── tauri.conf.json           # Tauri configuration
│   └── build.rs                  # Build script
│
├── frontend/                     # ⚛️ React Frontend
│   ├── assets/                   # Static assets
│   │   ├── images/
│   │   ├── fonts/
│   │   └── styles/
│   │       └── global.css
│   │
│   ├── components/               # React components
│   │   ├── common/               # Reusable components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Modal/
│   │   │   └── Layout/
│   │   │
│   │   └── features/             # Feature-specific components
│   │       ├── Dashboard/
│   │       └── Settings/
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useTheme.ts
│   │   └── useTauriCommand.ts
│   │
│   ├── services/                 # API & Tauri communication
│   │   ├── tauri/
│   │   │   ├── commands.ts       # Tauri invoke wrappers
│   │   │   └── events.ts         # Tauri event listeners
│   │   └── api.ts
│   │
│   ├── stores/                   # State management
│   │   ├── appStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── types/                    # TypeScript types
│   │   ├── index.ts
│   │   └── tauri.d.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── pages/                    # Page components (if using router)
│   │   ├── Home.tsx
│   │   └── Settings.tsx
│   │
│   ├── App.tsx                   # Main App component
│   ├── main.tsx                  # React entry point
│   └── vite-env.d.ts
│
├── public/                       # Public static files
│
├── tests/                        # Tests
│   ├── backend/                  # Rust tests
│   └── fronted/                  # React tests
│
├── .gitignore
├── package.json                  # Node dependencies
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite configuration
└── README.md
```
