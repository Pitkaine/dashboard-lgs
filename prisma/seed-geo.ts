import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const geoPages = [
  {
    slug: "mariage-bordeaux",
    contents: {
      fr: { title: "Vidéaste & Photographe de Mariage Bordeaux", body: {} },
      en: { title: "Wedding Videographer & Photographer Bordeaux", body: {} },
    },
    seo: {
      fr: { metaTitle: "Vidéaste & Photographe Mariage Bordeaux | Les Gars Sympas", metaDescription: "Vidéaste et photographe de mariage à Bordeaux. Capturer votre jour unique dans la magnifique région bordelaise." },
      en: { metaTitle: "Wedding Videographer & Photographer Bordeaux | The Nice Guys", metaDescription: "Wedding videographer and photographer in Bordeaux. Capturing your unique day in the beautiful Bordeaux region." },
    },
  },
  {
    slug: "mariage-lyon",
    contents: {
      fr: { title: "Vidéaste & Photographe de Mariage Lyon", body: {} },
      en: { title: "Wedding Videographer & Photographer Lyon", body: {} },
    },
    seo: {
      fr: { metaTitle: "Vidéaste & Photographe Mariage Lyon | Les Gars Sympas", metaDescription: "Vidéaste et photographe de mariage à Lyon. Films et photos de mariage dans la capitale de la gastronomie." },
      en: { metaTitle: "Wedding Videographer & Photographer Lyon | The Nice Guys", metaDescription: "Wedding videographer and photographer in Lyon. Wedding films and photos in the capital of gastronomy." },
    },
  },
  {
    slug: "mariage-provence",
    contents: {
      fr: { title: "Vidéaste & Photographe de Mariage Provence", body: {} },
      en: { title: "Wedding Videographer & Photographer Provence", body: {} },
    },
    seo: {
      fr: { metaTitle: "Vidéaste & Photographe Mariage Provence | Les Gars Sympas", metaDescription: "Vidéaste et photographe de mariage en Provence. Films et photos de mariage sous le soleil provençal." },
      en: { metaTitle: "Wedding Videographer & Photographer Provence | The Nice Guys", metaDescription: "Wedding videographer and photographer in Provence. Wedding films and photos under the Provençal sun." },
    },
  },
  {
    slug: "mariage-cote-azur",
    contents: {
      fr: { title: "Vidéaste & Photographe de Mariage Côte d'Azur", body: {} },
      en: { title: "Wedding Videographer & Photographer French Riviera", body: {} },
    },
    seo: {
      fr: { metaTitle: "Vidéaste & Photographe Mariage Côte d'Azur | Les Gars Sympas", metaDescription: "Vidéaste et photographe de mariage sur la Côte d'Azur. Films et photos de mariage sur la French Riviera." },
      en: { metaTitle: "Wedding Videographer & Photographer French Riviera | The Nice Guys", metaDescription: "Wedding videographer and photographer on the French Riviera. Wedding films and photos in the most glamorous destination." },
    },
  },
];

async function main() {
  console.log("Seeding geo pages...");

  for (const geo of geoPages) {
    const existing = await prisma.page.findUnique({ where: { slug: geo.slug } });
    if (existing) {
      console.log(`  ⏭ ${geo.slug} already exists, skipping`);
      continue;
    }

    await prisma.page.create({
      data: {
        slug: geo.slug,
        type: "GEO",
        status: "PUBLISHED",
        contents: {
          create: [
            { language: "fr", title: geo.contents.fr.title, body: geo.contents.fr.body },
            { language: "en", title: geo.contents.en.title, body: geo.contents.en.body },
          ],
        },
        seo: {
          create: [
            { language: "fr", metaTitle: geo.seo.fr.metaTitle, metaDescription: geo.seo.fr.metaDescription },
            { language: "en", metaTitle: geo.seo.en.metaTitle, metaDescription: geo.seo.en.metaDescription },
          ],
        },
      },
    });
    console.log(`  ✓ ${geo.slug} created`);
  }

  console.log("\nDone!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
