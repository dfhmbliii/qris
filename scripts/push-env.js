// Helper sementara: dorong variabel dari .env lokal ke project Vercel.
// Nilai rahasia tidak pernah dicetak ke output.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const envRaw = fs.readFileSync(path.join(root, '.env'), 'utf8');

const local = {};
for (const line of envRaw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) local[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}

const PROD_URL = 'https://gopay-merchant-gateway.vercel.app';

// Nama env var yang tidak ada di .env lokal tetapi wajib diisi.
local.ALLOWED_ORIGINS = PROD_URL;
local.APP_BASE_URL = PROD_URL;

const keys = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'FONNTE_TOKEN',
    'ALLOWED_ORIGINS',
    'APP_BASE_URL'
];

// Hanya environment "production". Environment "preview" meminta nama git
// branch secara interaktif, sehingga dilewati lewat CLI ini.
const targets = ['production'];

for (const key of keys) {
    const value = local[key];
    if (!value) {
        console.log(`LEWATI  ${key} (tidak ada di .env lokal)`);
        continue;
    }
    for (const target of targets) {
        const args = ['env', 'add', key, target, '--yes', '--force'];
        if (key === 'SUPABASE_URL') args.push('--no-sensitive');

        // Nilai dikirim lewat stdin, bukan argumen, supaya tidak bocor di process list.
        const r = spawnSync('npx', ['vercel', ...args], {
            cwd: root,
            encoding: 'utf8',
            input: value,
            shell: true
        });
        const out = `${r.stdout || ''}${r.stderr || ''}`.trim();
        const ok = /overrode|added|created/i.test(out);
        console.log(`${ok ? 'OK     ' : 'GAGAL  '} ${key} -> ${target}`);
        if (!ok) console.log('        ' + (r.error ? r.error.message : out.split('\n').filter(Boolean).slice(-4).join(' | ')));
    }
}