const fs = require('fs');

const seedPath = '\\\\wsl$\\Ubuntu\\home\\administrator\\web\\statman\\packages\\db\\prisma\\seed.ts';
let content = fs.readFileSync(seedPath, 'utf8');

const cardSeeding = `
  // ─────────────────────────────────────────────────────────────────────────
  // Cards & Saves (Discovery Demo Data)
  // ─────────────────────────────────────────────────────────────────────────
  const cardTarget = players[0];
  const cardTeam = teams[0];
  const cardGame = finalGame1;
  const existingCard = await db.cardTemplate.findFirst({ where: { title: 'First Game Dunk' } })
  if (!existingCard && cardTarget) {
    const card = await db.cardTemplate.create({
      data: {
        title: 'First Game Dunk',
        sportId: basketball.id,
        athleteProfileId: cardTarget.athleteProfileId,
        teamId: cardTeam.id,
        gameId: cardGame.id,
        seasonId: cardGame.seasonId,
        createdById: admin.id,
        theme: 'DARK',
        layout: 'HERO',
        frontImageUrl: 'https://picsum.photos/seed/statmancard1/600/900',
      }
    })
    
    // Create card save for popularity
    await db.cardSave.create({
      data: {
        userId: fan1.id,
        cardTemplateId: card.id,
      }
    })
    console.log('🌱 Seeded 1 featured card with 1 save')
  }
`;

content = content.replace("  console.log('\\nSeeding complete.')", cardSeeding + "\n  console.log('\\nSeeding complete.')");
fs.writeFileSync(seedPath, content);
console.log('Successfully updated seed.ts');
