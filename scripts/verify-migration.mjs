import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

function envFile(path) {
  return Object.fromEntries(readFileSync(path, 'utf8').split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line.includes('=')).map((line) => {
    const at = line.indexOf('=')
    return [line.slice(0, at), line.slice(at + 1).replace(/^"|"$/g, '')]
  }))
}

const sourceUrl = new URL(envFile(resolve('.env.test')).DATABASE_URL)
if (!/statman_test/.test(sourceUrl.pathname)) throw new Error('Migration verification requires the test database credentials')
const database = sourceUrl.pathname.replace(/^\//, '')
if (database !== 'statman_test') throw new Error('Refusing to reset any database except statman_test')
const mysqlArgs = ['-h', sourceUrl.hostname, '-P', sourceUrl.port || '3306', '-u', decodeURIComponent(sourceUrl.username), `-p${decodeURIComponent(sourceUrl.password)}`]

function mysql(sql, withDatabase = true) {
  const result = spawnSync('mysql', [...mysqlArgs, ...(withDatabase ? [database] : [])], { input: sql, encoding: 'utf8', stdio: ['pipe', 'inherit', 'inherit'] })
  if (result.status !== 0) throw new Error('mysql command failed')
}

function mysqlOutput(sql) {
  const result = spawnSync('mysql', [...mysqlArgs, '-N', database], { input: sql, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || 'mysql query failed')
  return result.stdout.trim()
}

function prisma(args) {
  const target = new URL(sourceUrl)
  target.pathname = `/${database}`
  const result = spawnSync('pnpm', ['--filter', '@statman/db', 'exec', 'prisma', ...args], { stdio: 'inherit', env: { ...process.env, DATABASE_URL: target.toString() } })
  if (result.status !== 0) throw new Error(`prisma ${args.join(' ')} failed`)
}

try {
  const tables = mysqlOutput('SHOW TABLES').split('\n').filter(Boolean)
  if (tables.length > 0) mysql(`SET FOREIGN_KEY_CHECKS=0; ${tables.map((table) => `DROP TABLE \`${table}\`;`).join(' ')} SET FOREIGN_KEY_CHECKS=1;`)
  mysql(readFileSync('packages/db/prisma/migrations/20260712000000_baseline/migration.sql', 'utf8'))
  mysql(`
    INSERT INTO User (id,email,passwordHash,updatedAt) VALUES ('u1','migration@example.test','hash',NOW(3));
    INSERT INTO Sport (id,slug,name,updatedAt) VALUES ('s1','migration-basketball','Basketball',NOW(3));
    INSERT INTO League (id,sportId,slug,name,updatedAt) VALUES ('l1','s1','migration-league','Migration League',NOW(3));
    INSERT INTO Season (id,leagueId,slug,name,updatedAt) VALUES ('se1','l1','migration-season','2025-26',NOW(3));
    INSERT INTO Team (id,sportId,leagueId,slug,name,updatedAt) VALUES ('t1','s1','l1','migration-team','Migration Team',NOW(3));
    INSERT INTO AthleteProfile (id,slug,firstName,lastName,claimedByUserId,updatedAt) VALUES ('a1','migration-athlete','Migration','Athlete','u1',NOW(3));
    INSERT INTO Player (id,athleteProfileId,sportId,updatedAt) VALUES ('p1','a1','s1',NOW(3));
    INSERT INTO RosterMembership (id,playerId,teamId,seasonId,updatedAt) VALUES ('r1','p1','t1','se1',NOW(3));
    INSERT INTO Game (id,sportId,leagueId,seasonId,scheduledAt,status,updatedAt) VALUES ('g1','s1','l1','se1',NOW(3),'FINAL',NOW(3));
    INSERT INTO GameTeam (id,gameId,teamId,isHome,finalScore) VALUES ('gt1','g1','t1',true,72);
    INSERT INTO ImageAsset (id,targetType,targetId,\`usage\`,objectKey,url,contentType,byteSize,uploadedByUserId) VALUES ('im1','ATHLETE_PROFILE','a1','GALLERY','migration/image.jpg','https://example.test/image.jpg','image/jpeg',100,'u1');
    INSERT INTO MediaAsset (id,youtubeVideoId,title,targetType,targetId,uploadedByUserId,updatedAt) VALUES ('m1','video123','Migration highlight','PLAYER','p1','u1',NOW(3));
    INSERT INTO CardTemplate (id,athleteProfileId,teamId,gameId,createdByUserId,title,cardType,stylePreset,status,statsSnapshotJson,sourceImageAssetId,updatedAt) VALUES ('c1','a1','t1','g1','u1','Migration Card','PROFILE','classic','READY',JSON_OBJECT(),'im1',NOW(3));
    INSERT INTO CardIssue (id,cardTemplateId,issueNumber,claimedByUserId,issueHash) VALUES ('ci1','c1',1,'u1','migration-hash');
    INSERT INTO CardGenerationJob (id,cardTemplateId,status,inputJson,updatedAt) VALUES ('j1','c1','READY',JSON_OBJECT(),NOW(3));
  `)

  prisma(['migrate', 'resolve', '--applied', '20260712000000_baseline'])
  prisma(['migrate', 'deploy'])

  mysql(`
    INSERT INTO CardSave (id,userId,cardTemplateId) VALUES ('save1','u1','c1');
    INSERT INTO CardDownloadEvent (id,cardTemplateId,cardIssueId,downloadedByUserId,context) VALUES ('download1','c1','ci1','u1','PROFILE');
    SELECT COUNT(*) AS athletes FROM AthleteProfile;
    SELECT COUNT(*) AS teams FROM Team;
    SELECT COUNT(*) AS games FROM Game;
    SELECT COUNT(*) AS cards FROM CardTemplate;
    SELECT COUNT(*) AS jobs FROM CardGenerationJob;
    SELECT COUNT(*) AS saves FROM CardSave;
    SELECT COUNT(*) AS downloads FROM CardDownloadEvent;
    SELECT COUNT(*) AS media FROM MediaAsset;
  `)
  console.log('Populated baseline migration verification passed')
} finally {}
