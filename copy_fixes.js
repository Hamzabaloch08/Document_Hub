const fs = require("fs");

const ws = fs.readFileSync(
  "src/features/workspace/screens/WorkspaceScreen_fixed.tsx",
  "utf-8",
);
fs.writeFileSync("src/features/workspace/screens/WorkspaceScreen.tsx", ws);
fs.unlinkSync("src/features/workspace/screens/WorkspaceScreen_fixed.tsx");

const tw = fs.readFileSync(
  "src/features/workspace/screens/TabsWorkspacesScreen_fixed.tsx",
  "utf-8",
);
fs.writeFileSync("src/features/workspace/screens/TabsWorkspacesScreen.tsx", tw);
fs.unlinkSync("src/features/workspace/screens/TabsWorkspacesScreen_fixed.tsx");

console.log("✅ Fixed!");
