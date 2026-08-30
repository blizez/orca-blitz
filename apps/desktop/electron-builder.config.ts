import type { Configuration } from "electron-builder";

const config: Configuration = {
  appId: "com.orcablitz.desktop",
  productName: "orca-blitz",
  directories: {
    buildResources: "build",
  },
  files: [
    "!**/.vscode/*",
    "!src/*",
    "!electron.vite.config.*",
    "!{.eslintignore,.eslintrc.cjs,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}",
    "!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}",
  ],
  asarUnpack: ["resources/**"],
  win: {
    executableName: "orca-blitz",
    target: ["nsis"],
  },
  nsis: {
    artifactName: "${name}-${version}-setup.${ext}",
    shortcutName: "${productName}",
    uninstallDisplayName: "${productName}",
    createDesktopShortcut: true,
  },
  linux: {
    target: ["AppImage", "snap"],
    maintainer: "orca-blitz",
    category: "Utility",
  },
  mac: {
    entitlementsInherit: "build/entitlements.mac.plist",
    extendInfo: {
      NSDocumentsFolderUsageDescription:
        "Application requests access to the user's Documents folder.",
      NSDownloadsFolderUsageDescription:
        "Application requests access to the user's Downloads folder.",
    },
    notarize: false,
  },
};

export default config;
