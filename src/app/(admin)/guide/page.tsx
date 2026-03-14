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
  LayoutTemplate,
  MessageSquare,
} from "lucide-react";

const sections = [
  {
    icon: FileText,
    title: "Pages",
    description: "Gérez les pages de contenu du site (services, pages légales, landing pages).",
    steps: [
      "Allez dans Pages pour voir toutes les pages existantes",
      "Cliquez sur une page pour l'éditer",
      "Utilisez les onglets 🇫🇷 FR / 🇬🇧 EN pour rédiger le contenu dans les deux langues",
      "Le panneau SEO (à droite) permet de définir le titre et la description pour Google",
      "Changez le statut en 'Publié' quand la page est prête",
      "Cliquez sur 'Sauvegarder' en haut à droite — l'auto-save fonctionne aussi toutes les 30 secondes",
    ],
    tips: [
      "Le slug URL se génère automatiquement depuis le titre FR",
      "Les pages de type Service, Géo, Légal, À propos et FAQ utilisent un éditeur structuré avec des champs dédiés",
      "Les pages Blog utilisent l'éditeur Tiptap (comme Notion) — tapez '/' pour insérer des blocs",
    ],
  },
  {
    icon: LayoutTemplate,
    title: "Éditeurs structurés",
    description: "10 pages du site utilisent des éditeurs structurés au lieu de l'éditeur libre Tiptap. Chaque champ correspond exactement à un élément sur la page du site.",
    steps: [
      "Ouvrez une page de type Service, Géo, Légal, Landing (à propos / FAQ)",
      "Un badge bleu 'Éditeur structuré actif' confirme que le formulaire structuré est utilisé",
      "Remplissez les champs : titres, paragraphes, sections, FAQ, CTA...",
      "Ajoutez ou supprimez des éléments dynamiques (questions FAQ, sections, membres d'équipe...)",
      "Chaque modification est sauvegardée avec le bouton 'Sauvegarder' en haut à droite",
      "Les modifications apparaissent immédiatement sur le site une fois la page publiée",
    ],
    tips: [
      "Pages GÉO (4 villes) : hero + intro + 5 sections + CTA",
      "Pages LÉGALES (mentions + confidentialité) : blocs dynamiques par type (paragraphe, liste, clé-valeur)",
      "Pages SERVICE (vidéaste + photographe) : sections polymorphes + FAQ + régions + CTA",
      "Page À PROPOS : hero + histoire + chiffres clés + équipe + philosophie + CTA",
      "Page FAQ : intro SEO (3 paragraphes) + questions/réponses dynamiques + footer",
    ],
  },
  {
    icon: BookOpen,
    title: "Blog",
    description: "Rédigez et publiez des articles de blog bilingues (FR + EN).",
    steps: [
      "Cliquez sur 'Nouvel article' pour créer un article",
      "Remplissez le titre, la description (pour Google) et le contenu",
      "Ajoutez une image de bannière et une miniature",
      "Les articles doivent être créés séparément en FR et EN",
      "Publiez en changeant le statut à '1'",
    ],
    tips: [
      "La miniature apparaît dans la liste du blog sur le site",
      "La bannière s'affiche en haut de l'article",
      "Les articles avec le plus de vues apparaissent sur le tableau de bord",
    ],
  },
  {
    icon: Camera,
    title: "Portfolio",
    description: "Ajoutez vos mariages avec photos, vidéos et liens YouTube.",
    steps: [
      "Cliquez sur 'Nouveau mariage' pour créer une entrée",
      "Onglet INFO : remplissez titre, lieu, salle, description en FR et EN",
      "Onglet MEDIAS : uploadez des photos, ajoutez des liens YouTube, réordonnez par glisser-déposer",
      "Définissez une photo de couverture (elle apparaît sur la page portfolio du site)",
      "Onglet SEO : vérifiez le slug URL",
      "Passez en 'Publié' — le mariage apparaîtra automatiquement sur le site",
    ],
    tips: [
      "Pour YouTube : collez l'URL complète (ex: https://youtube.com/watch?v=xxx)",
      "La photo de couverture est celle affichée dans la grille du portfolio",
      "Formats acceptés : JPG, PNG, WebP (compressés automatiquement)",
    ],
  },
  {
    icon: DollarSign,
    title: "Tarifs",
    description: "Gérez les formules tarifaires affichées sur le site.",
    steps: [
      "Les 5 formules actuelles (Photo, Video, Porto, Paris, Geneva) sont déjà créées",
      "Cliquez sur une formule pour modifier son contenu",
      "Modifiez le nom, sous-titre et description en FR et EN",
      "Gérez la liste des features (ce qui est inclus dans la formule)",
      "Cochez 'Populaire' pour la formule mise en avant (étoile sur le site)",
      "Réordonnez les formules par glisser-déposer dans la liste",
    ],
    tips: [
      "Les prix ne sont PAS affichés sur le site (seulement 'À partir de 3 200 euros')",
      "Les prix dans le dashboard servent de référence interne uniquement",
      "Le site affiche 'Nous contacter' sur chaque carte au lieu du prix",
    ],
  },
  {
    icon: Globe,
    title: "Pages géo",
    description: "Éditez les pages de villes (Bordeaux, Lyon, Provence, Côte d'Azur).",
    steps: [
      "Les pages géo sont des Pages de type 'GEO' — cette vue les filtre",
      "Cliquez sur une page pour l'éditer avec l'éditeur structuré GEO",
      "Chaque page géo cible un mot-clé géographique pour le SEO",
      "Rédigez du contenu unique pour chaque ville (pas de copier-coller)",
    ],
    tips: [
      "Pour ajouter une nouvelle ville, créez une Page avec le type 'GEO'",
      "N'oubliez pas de l'ajouter au sitemap et aux routes i18n (demandez à Claude)",
    ],
  },
  {
    icon: MessageSquare,
    title: "FAQ",
    description: "Gérez les questions fréquentes affichées sur la page FAQ du site.",
    steps: [
      "Ajoutez des questions/réponses bilingues (FR + EN)",
      "Réordonnez les questions par glisser-déposer",
      "Activez ou désactivez des questions avec le toggle de statut",
      "Seules les questions publiées apparaissent sur le site",
    ],
    tips: [
      "Les FAQ apparaissent dans le schema JSON-LD (bon pour le SEO Google)",
      "La page FAQ du site a aussi une intro SEO éditable depuis Pages > FAQ",
      "Privilégiez des réponses détaillées (2-3 phrases minimum) pour le référencement",
    ],
  },
  {
    icon: Users,
    title: "Équipe",
    description: "Gérez les membres de l'équipe affichés sur la page d'accueil.",
    steps: [
      "Cliquez sur '+' pour ajouter un membre",
      "Remplissez le nom, le poste principal (job) et le poste secondaire (job2)",
      "Uploadez une photo de profil (elle sera compressée automatiquement)",
      "Cliquez sur un membre existant pour le modifier",
      "Survolez une carte et cliquez sur la corbeille pour supprimer",
    ],
    tips: [
      "Les photos apparaissent en cercle sur le site — privilégiez des portraits carrés",
      "Le 'job' et 'job2' utilisent des clés de traduction (job1=Vidéaste, job2=Photographe, etc.)",
      "Laissez job2 vide si le membre n'a qu'un seul rôle",
    ],
  },
  {
    icon: Settings,
    title: "Paramètres",
    description: "Configurez les paramètres globaux du site.",
    steps: [
      "Les paramètres sont groupés par catégorie (contact, réseaux sociaux, SEO...)",
      "Modifiez les valeurs selon vos besoins",
      "Cliquez sur 'Enregistrer' pour sauvegarder tous les changements d'un coup",
    ],
    tips: [
      "Les paramètres ne sont pas encore utilisés dynamiquement par le site",
      "Ils serviront à centraliser la configuration (téléphone, email, liens réseaux...)",
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
          <h1 className="text-3xl font-bold text-foreground">
            Guide d&apos;utilisation
          </h1>
        </div>
        <p className="text-muted-foreground">
          Tout ce que vous devez savoir pour gérer votre site depuis ce
          dashboard.
        </p>
      </div>

      {/* Quick start */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">
              Pour commencer
            </h2>
            <ol className="text-sm text-amber-800 dark:text-amber-400 space-y-1 list-decimal list-inside">
              <li>
                <strong>Ajoutez vos mariages</strong> dans Portfolio avec photos
                + liens YouTube
              </li>
              <li>
                <strong>Vérifiez les formules</strong> dans Tarifs — elles sont
                déjà créées depuis la brochure 2026
              </li>
              <li>
                <strong>Éditez les pages</strong> — 10 pages sont éditables avec des formulaires structurés
              </li>
              <li>
                <strong>Rédigez des articles</strong> dans Blog pour améliorer
                le SEO
              </li>
              <li>
                <strong>Mettez à jour l&apos;équipe</strong> si nécessaire
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Important notes */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Points importants
            </h2>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                <span>
                  Les modifications sont <strong>instantanées</strong> — dès que
                  vous publiez, c&apos;est en ligne
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                <span>
                  Tout le contenu doit être en{" "}
                  <strong>français ET anglais</strong> (site bilingue)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                <span>
                  Les images sont <strong>compressées automatiquement</strong>{" "}
                  en WebP pour la performance
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                <span>
                  Utilisez le statut <strong>Brouillon</strong> pour préparer du
                  contenu sans le publier
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                <span>
                  Le bouton <strong>Sauvegarder</strong> est toujours en haut à droite dans l&apos;éditeur
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
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="px-6 py-4 bg-muted border-b border-border flex items-center gap-3">
              <Icon className="size-5 text-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                {section.title}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-muted-foreground">{section.description}</p>

              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">
                  Comment faire
                </h3>
                <ol className="space-y-1.5 list-decimal list-inside">
                  {section.steps.map((step, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {section.tips.length > 0 && (
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">
                    Astuces
                  </h3>
                  <ul className="space-y-1">
                    {section.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
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
      <div className="bg-neutral-900 dark:bg-neutral-950 rounded-xl p-6 text-center">
        <h2 className="text-lg font-semibold text-white mb-2">
          Besoin d&apos;aide ?
        </h2>
        <p className="text-neutral-400 text-sm mb-4">
          Pour toute question technique ou demande de fonctionnalité,
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
