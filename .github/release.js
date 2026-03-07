import fs from 'node:fs/promises'
import { execSync } from 'node:child_process'

async function run() {
  const newVersion = process.argv[2]

  if (!newVersion) {
    console.error('❌ Please provide a version number as an argument. Example: npm run release -- 2.1.0')
    process.exit(1)
  }

  const cleanVersion = newVersion.replace(/^v/, '')

  console.log(`🚀 Preparing release v${cleanVersion}...`)

  console.log('📦 Updating package.json...')
  execSync(`npm version ${cleanVersion} --no-git-tag-version`)

  console.log('📝 Updating README.md...')
  let readme = await fs.readFile('README.md', 'utf-8')
  readme = readme.replace(/badge\/version-([a-zA-Z0-9.\-]+)-orangered/, `badge/version-${cleanVersion.replace('-', '--')}-orangered`)
  await fs.writeFile('README.md', readme)

  console.log('⚙️ Generating files from templates...')
  const templates = [
    { name: 'docker-compose.prod.yml', target: 'docker/docker-compose.prod.yml' },
    { name: 'install.sh', target: `.github/scripts/eml-admintool@${cleanVersion}` },
    { name: 'changelog.md', target: `.github/changelogs/v${cleanVersion}.md` }
  ]

  for (const file of templates) {
    let content = await fs.readFile(`.github/templates/${file.name}`, 'utf-8')
    content = content.replace(/\{\{VERSION\}\}/g, cleanVersion)

    await fs.writeFile(file.target, content)
  }

  console.log('✅ Release preparation complete!')
  console.log(`\nNext steps:`)
  console.log(`1. Write your changelog in .github/changelogs/v${cleanVersion}.md`)
  console.log(`2. git add .`)
  console.log(`3. git commit -m "chore: release v${cleanVersion}"`)
  console.log(`4. git tag v${cleanVersion}`)
  console.log(`5. git push origin main --tags`)
}

run().catch(console.error)
