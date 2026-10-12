const fs = require('fs');
const tabs = ['documents', 'forensics', 'identity', 'cross-check', 'evidence', 'timeline', 'review'];
for (const t of tabs) {
  fs.writeFileSync(`src/app/cases/[id]/${t}/page.tsx`, `export default function Tab() { return <div className="p-space-xl bg-surface-workstation rounded-lg border border-border-subtle text-center text-outline font-body-lg">Connect Backend to view ${t} data.</div>; }`);
}
