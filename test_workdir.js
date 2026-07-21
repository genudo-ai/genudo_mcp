// Self-check for GENUDO_WORKDIR resolution in the editing playbook.
// Run: node test_workdir.js
const assert = require('assert');
const { execFileSync } = require('child_process');

// guides.js reads process.env once at module load, so each case needs its own process.
function rootLine(workdir) {
  const out = execFileSync(
    process.execPath,
    ['-e', "process.stdout.write(require('./guides.js').handleLocalToolCall('get_editing_playbook').content[0].text)"],
    { env: { ...process.env, GENUDO_WORKDIR: workdir }, cwd: __dirname }
  ).toString();
  return out.match(/^Staging root is `(.+?)`/m)[1];
}

assert.strictEqual(rootLine(''), '.', 'unset falls back to the current directory');
assert.strictEqual(rootLine('/Users/me/genudo'), '/Users/me/genudo', 'absolute path is used as-is');
assert.strictEqual(rootLine('/Users/me/genudo//'), '/Users/me/genudo', 'trailing slashes stripped');
assert.strictEqual(rootLine('  /Users/me/genudo  '), '/Users/me/genudo', 'surrounding whitespace stripped');
assert.strictEqual(rootLine('${user_config.workdir}'), '.', 'unfilled mcpb placeholder ignored');

console.log('workdir resolution: 5/5 ok');
