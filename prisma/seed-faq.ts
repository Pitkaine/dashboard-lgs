import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const faqData = [
  {
    fr: {
      question: "Quels sont vos tarifs et les différentes options que vous proposez en vidéo ?",
      answer: "Nos tarifs sont à partir de 2 590€ pour un film entre 5 et 8 minutes. De nombreuses options sont proposés en plus : remise des discours, teaser 1 minute, film long, séance couple avant ou après le mariage, drone, édition et diffusion d'un teaser le jour J.",
    },
    en: {
      question: "What are your rates and the different options you offer for video services?",
      answer: "Our rates start at €2,590 for a 5 to 8-minute film. Many additional options are available: speeches highlights, 1-minute teaser, long film, couple session before or after the wedding, drone coverage, editing, and same-day teaser delivery.",
    },
  },
  {
    fr: {
      question: "Comment puis-je réserver vos services pour mon mariage ?",
      answer: "Pour réserver, nous faisons un premier contact autour d'une boisson chaude (ou pas) sinon via visio. Une fois le contrat signé et l'acompte reçu, la date est réservée.",
    },
    en: {
      question: "How can I book your services for my wedding?",
      answer: "To book, we begin with an initial meeting over a warm drink (or not), or via video call. Once the contract is signed and the deposit is received, your date is reserved.",
    },
  },
  {
    fr: {
      question: "Travaillez-vous seul ou en équipe ? Combien de vidéastes seront présents le jour du mariage ?",
      answer: "Tout dépendra de l'ampleur de votre mariage. Le nombre d'invité est un facteur à prendre en considération, vos attentes et bien évidemment votre budget",
    },
    en: {
      question: "Do you work alone or as a team? How many videographers will be present on the wedding day?",
      answer: "It depends on the size of your wedding. Factors such as the number of guests, your expectations, and of course, your budget, will determine the team size.",
    },
  },
  {
    fr: {
      question: "Pourquoi en équipe ?",
      answer: "Etre à deux ou plus et une plus-valu car cela permet de répartir la charge de travail le jour J, être plus efficace, des points de vues différents, une sécurité.",
    },
    en: {
      question: "Why work as a team?",
      answer: "Having two or more people is a great advantage as it allows us to distribute the workload on the wedding day, be more efficient, provide diverse perspectives, and ensure security.",
    },
  },
  {
    fr: {
      question: "À quel moment serons-nous en mesure de visionner la vidéo finale de notre mariage ?",
      answer: "La partie montage est la plus longue et minutieuse, nous avons le soucis du détail et prenons soin de vous livrer un film à la hauteur de vos attentes. C'est pourquoi il faudra patienter entre 1 et 3 mois selon la période.",
    },
    en: {
      question: "When will we be able to watch the final video of our wedding?",
      answer: "The editing process is meticulous and time-consuming. We take care to deliver a film that meets your expectations. Therefore, you should expect a delivery time of 1 to 3 months, depending on the season.",
    },
  },
  {
    fr: {
      question: "Fournissez-vous les fichiers bruts de nos vidéos de mariage ?",
      answer: "C'est une option que nous proposons en plus de la formule de base.",
    },
    en: {
      question: "Do you provide the raw footage of our wedding videos?",
      answer: "This is an option we offer in addition to the basic package.",
    },
  },
  {
    fr: {
      question: "Êtes-vous prêt à voyager en dehors de votre région pour couvrir un mariage ?",
      answer: "Nos valise sont déjà prête ! Où allons-nous ?",
    },
    en: {
      question: "Are you willing to travel outside your region to cover a wedding?",
      answer: "Our bags are already packed! Where are we headed?",
    },
  },
];

async function main() {
  console.log("Seeding FAQ items...");

  // Clear existing FAQ data
  await prisma.faqContent.deleteMany();
  await prisma.faqItem.deleteMany();

  for (let i = 0; i < faqData.length; i++) {
    const item = faqData[i];
    await prisma.faqItem.create({
      data: {
        position: i,
        status: "PUBLISHED",
        contents: {
          create: [
            { language: "fr", question: item.fr.question, answer: item.fr.answer },
            { language: "en", question: item.en.question, answer: item.en.answer },
          ],
        },
      },
    });
    console.log(`  ✓ Q${i + 1}: ${item.fr.question.substring(0, 50)}...`);
  }

  console.log(`\nDone! ${faqData.length} FAQ items seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
