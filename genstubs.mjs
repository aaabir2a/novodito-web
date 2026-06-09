import fs from 'fs';
const routes = [
  ['tournaments','🏆','Tournaments','All 2026 eFootball tournaments with brackets, schedules, and live status.'],
  ['rankings','📊','Rankings','National leaderboard updated weekly. Track top players across the 2026 season.'],
  ['matches','⚽','Matches','Match results, fixtures, and live scores from every Nobodito event.'],
  ['news','📰','News','Tournament announcements, player updates, and official partner news.'],
  ['shop','🛒','Official Store','Jerseys, merch, and collectibles from Bangladesh\'s #1 eFootball platform.'],
  ['gallery','📸','Gallery','Photos and highlights from tournaments, finals, and community events.'],
  ['clubs','🛡️','Clubs','Registered clubs, rosters, and standings across the Nobodito league.'],
  ['fixtures','📅','Fixtures','Upcoming match schedule across all active tournaments.'],
  ['register','📝','Player Registration','Join the 2026 season. ৳600 entry fee. All skill levels welcome.'],
  ['sponsorship','🤝','Sponsorship','Partner with Bangladesh\'s premier eFootball tournament organizer.'],
  ['about','ℹ️','About Nobodito','Official Konami eFootball partner building competitive gaming in Bangladesh.'],
  ['contact','📞','Contact','Get in touch with the Nobodito Gaming team.'],
  ['login','👤','Player Login','Sign in to your player portal to manage registrations and stats.'],
  ['admin','🔐','Admin','Administrator access to the Nobodito management console.'],
];
const titleCase = s => s.split(' ').map(w=>w).join(' ');
for(const [slug,icon,title,blurb] of routes){
  const dir = `src/app/${slug}`;
  fs.mkdirSync(dir,{recursive:true});
  const tsx = `import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(blurb)},
};

export default function Page() {
  return (
    <PageStub icon=${JSON.stringify(icon)} title=${JSON.stringify(title)} blurb=${JSON.stringify(blurb)} />
  );
}
`;
  fs.writeFileSync(`${dir}/page.tsx`, tsx);
}
// nested clubs/login
fs.mkdirSync('src/app/clubs/login',{recursive:true});
fs.writeFileSync('src/app/clubs/login/page.tsx', `import type { Metadata } from "next";
import PageStub from "@/components/PageStub";

export const metadata: Metadata = { title: "Club Login", description: "Sign in to your club portal." };

export default function Page() {
  return <PageStub icon="🛡️" title="Club Login" blurb="Sign in to manage your club roster, fixtures, and tournament entries." />;
}
`);
console.log('stub routes written:', routes.length+1);
