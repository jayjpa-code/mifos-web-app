/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const fs = require('node:fs');
const path = require('node:path');

const outputDir = path.resolve(process.cwd(), 'dist', 'web-app', 'browser', 'assets');
const templatePath = path.join(outputDir, 'env.template.js');
const targetPath = path.join(outputDir, 'env.js');

if (!fs.existsSync(templatePath)) {
  throw new Error(`Netlify environment template not found at ${templatePath}`);
}

const secretPattern = /(SECRET|TOKEN|PASSWORD|CREDENTIAL|API_KEY|PRIVATE_KEY)/i;
const template = fs.readFileSync(templatePath, 'utf8');

const rendered = template.replace(/\$([A-Z0-9_]+)/g, (_match, variableName) => {
  // Browser-delivered JavaScript must never receive server-side secrets.
  // Any integration that requires a secret must be proxied through the Render backend.
  if (secretPattern.test(variableName)) {
    return '';
  }

  return process.env[variableName] ?? '';
});

fs.writeFileSync(targetPath, rendered, 'utf8');
console.log(`Generated ${path.relative(process.cwd(), targetPath)} from Netlify environment variables.`);
