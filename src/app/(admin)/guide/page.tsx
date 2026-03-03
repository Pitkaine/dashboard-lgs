import {
  BookOpen,
  Camera,
  DollarSign,
  FileText,
  Globe,
  HelpCircle,
  Settings,
  Users,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

const sections = [
  {
    icon: FileText,
    title: "Pages",
    description: "Gerez les pages de contenu du site (services, pages legales, landing pages).",
    steps: [
      "Allez dans Pages pour voir toutes les pages existantes",
      "Cliquez sur une page pour l'editer",
      "Utilisez les onglets FR / EN pour rediger le contenu dans les deux langues",
      "L'editeur Tiptap fonctionne comme Notion : tapez '/' pour inserer des blocs",
      "Le panneau SEO (a droite) permet de definir le titre et la description pour Google",
      "Changez le statut en 'Publie' quand la page est prete",
    ],
    tips: [
      "Le slug URL se genere automatiquement depuis le titre FR",
      "Sauvegardez regulierement — l'auto-save fonctionne toutes les 30 secondes",
    ],
  },
  {
    icon: BookOpen,
    title: "Blog",
    description: "Redigez et publiez des articles de blog bilingues (FR + EN).",
    steps: [
      "Cliquez sur 'Nouvel article' pour creer un article",
      "Remplissez le titre, la description (pour Google) et le contenu",
      "Ajoutez une image de banniere et une miniature",
      "Les articles doivent etre crees separement en FR et EN",
      "Publiez en changeant le statut a '1'",
    ],
    tips: [
      "La miniature apparait dans la liste du blog sur le site",
      "La banniere s'affiche en haut de l'article",
      "Les articles avec le plus de vues apparaissent sur le tableau de bord",
    ],
  },
  {
    icon: Camera,
    title: "Portfolio",
    description: "Ajoutez vos mariages avec photos, videos et liens YouTube.",
    steps: [
      "Cliquez sur 'Nouveau mariage' pour creer une entree",
      "Onglet INFO : remplissez titre, lieu, salle, description en FR et EN",
      "Onglet MEDIAS : uploadez des photos, ajoutez des liens YouTube, reordonnez par glisser-deposer",
      "Definissez une photo de couverture (elle apparait sur la page portfolio du site)",
      "Onglet SEO : verifiez le slug URL",
      "Passez en 'Publie' — le mariage apparaitra automatiquement sur le site",
    ],
    tips: [
      "Pour YouTube : collez l'URL complete (ex: https://youtube.com/watch?v=xxx)",
      "La photo de couverture est celle affichee dans la grille du portfolio",
      "Formats acceptes : JPG, PNG, WebP (compresses automatiquement)",
    ],
  },
  {
    icon: DollarSign,
    title: "Tarifs",
    description: "Gerez les formules tarifaires affichees sur le site.",
    steps: [
      "Les 5 formules actuelles (Photo, Video, Porto, Paris, Geneva) sont deja creees",
      "Cliquez sur une formule pour modifier son contenu",
      "Modifiez le nom, sous-titre et description en FR et EN",
      "Gerez la liste des features (ce qui est inclus dans la formule)",
      "Cochez 'Populaire' pour la formule mise en avant (etoile sur le site)",
      "Reordonnez les formules par glisser-deposer dans la liste",
    ],
    tips: [
      "Les prix ne sont PAS affiches sur le site (seulement 'A partir de 3 200 euros')",
      "Les prix dans le dashboard servent de reference interne uniquement",
      "Le site affiche 'Nous contacter' sur chaque carte au lieu du prix",
    ],
  },
  {
    icon: Globe,
    title: "Pages geo",
    description: "Editez les pages de villes (Bordeaux, Lyon, Provence, Cote d'Azur).",
    steps: [
      "Les pages geo sont des Pages de type 'GEO' — cette vue les filtre",
      "Cliquez sur une page pour l'editer (meme editeur que les Pages)",
      "Chaque page geo cible un mot-cle geographique pour le SEO",
      "Redigez du contenu unique pour chaque ville (pas de copier-coller)",
    ],
    tips: [
      "Pour ajouter une nouvelle ville, creez une Page avec le type 'GEO'",
      "N'oubliez pas de l'ajouter au sitemap et aux routes i18n (demandez a Claude)",
    ],
  },
  {
    icon: Users,
    title: "Equipe",
    description: "Gerez les membres de l'equipe affiches sur la page d'accueil.",
    steps: [
      "Cliquez sur '+' pour ajouter un membre",
      "Remplissez le nom, le poste principal (job) et le poste secondaire (job2)",
      "Uploadez une photo de profil (elle sera compressée automatiquement)",
      "Cliquez sur un membre existant pour le modifier",
      "Survolez une carte et cliquez sur la corbeille pour supprimer",
    ],
    tips: [
      "Les photos apparaissent en cercle sur le site — privilegiez des portraits carres",
      "Le 'job' et 'job2' utilisent des cles de traduction (job1=Videaste, job2=Photographe, etc.)",
      "Laissez job2 vide si le membre n'a qu'un seul role",
    ],
  },
  {
    icon: Settings,
    title: "Parametres",
    description: "Configurez les parametres globaux du site.",
    steps: [
      "Les parametres sont groupes par categorie (contact, reseaux sociaux, SEO...)",
      "Modifiez les valeurs selon vos besoins",
      "Cliquez sur 'Enregistrer' pour sauvegarder tous les changements d'un coup",
    ],
    tips: [
      "Les parametres ne sont pas encore utilises dynamiquement par le site",
      "Ils serviront a centraliser la configuration (telephone, email, liens reseaux...)",
    ],
  },
];

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="size-8 text-amber-500" />
          <h1 className="text-3xl font-bold text-neutral-900">
            Guide d&apos;utilisation
          </h1>
        </div>
        <p className="text-neutral-500">
          Tout ce que vous devez savoir pour gerer votre site depuis ce
          dashboard.
        </p>
      </div>

      {/* Quick start */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="size-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold text-amber-900 mb-2">
              Pour commencer
            </h2>
            <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
              <li>
                <strong>Ajoutez vos mariages</strong> dans Portfolio avec photos
                + liens YouTube
              </li>
              <li>
                <strong>Verifiez les formules</strong> dans Tarifs — elles sont
                deja creees depuis la brochure 2026
              </li>
              <li>
                <strong>Redigez des articles</strong> dans Blog pour ameliorer
                le SEO
              </li>
              <li>
                <strong>Mettez a jour l&apos;equipe</strong> si necessaire
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Important notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold text-blue-900 mb-2">
              Points importants
            </h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                <span>
                  Les modifications sont <strong>instantanees</strong> — des que
                  vous publiez, c&apos;est en ligne
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                <span>
                  Tout le contenu doit etre en{" "}
                  <strong>francais ET anglais</strong> (site bilingue)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                <span>
                  Les images sont <strong>compressees automatiquement</strong>{" "}
                  en WebP pour la performance
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                <span>
                  Utilisez le statut <strong>Brouillon</strong> pour preparer du
                  contenu sans le publier
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Module sections */}
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <div
            key={section.title}
            className="bg-white border border-neutral-200 rounded-xl overflow-hidden"
          >
            <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center gap-3">
              <Icon className="size-5 text-neutral-700" />
              <h2 className="text-lg font-semibold text-neutral-900">
                {section.title}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-neutral-600">{section.description}</p>

              <div>
                <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2">
                  Comment faire
                </h3>
                <ol className="space-y-1.5 list-decimal list-inside">
                  {section.steps.map((step, i) => (
                    <li key={i} className="text-sm text-neutral-600">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {section.tips.length > 0 && (
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2">
                    Astuces
                  </h3>
                  <ul className="space-y-1">
                    {section.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="text-sm text-neutral-500 flex items-start gap-2"
                      >
                        <span className="text-amber-500 mt-0.5">&#9733;</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Support footer */}
      <div className="bg-neutral-900 rounded-xl p-6 text-center">
        <h2 className="text-lg font-semibold text-white mb-2">
          Besoin d&apos;aide ?
        </h2>
        <p className="text-neutral-400 text-sm mb-4">
          Pour toute question technique ou demande de fonctionnalite,
          contactez Peter ou utilisez Claude Code.
        </p>
        <a
          href="https://www.lesgarssympas.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >
          <ExternalLink className="size-4" />
          Voir le site en ligne
        </a>
      </div>
    </div>
  );
}
