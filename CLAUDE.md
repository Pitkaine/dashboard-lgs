# CLAUDE.md — Dashboard CMS Les Gars Sympas

> Ce fichier est lu automatiquement par Claude Code. Il contient le contexte et les regles du projet Dashboard.

---

## IDENTITE DU PROJET

- **Dashboard CMS** : dashboard.lesgarssympas.com
- **Objectif** : CMS complet pour gerer le site lesgarssympas.com sans toucher au code
- **Admin** : Peter (peter@lesgarssympas.com)

---

## STACK TECHNIQUE

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| React | React + React-DOM | 19.x |
| Langage | TypeScript | tsconfig.json |
| UI | Tailwind CSS + shadcn/ui | v4 |
| Editeur | Tiptap | latest |
| Auth | NextAuth.js (credentials) | latest |
| ORM | Prisma Client | 6.19.x |
| BDD | MySQL (partagee avec site) | via DATABASE_URL |
| Drag & Drop | @hello-pangea/dnd | latest |
| Icons | lucide-react | latest |
| Validation | zod | latest |
| Images | sharp | latest |

---

## INFRASTRUCTURE

```
Chemin      : /var/www/dashboard-lgs/
Port        : 3001
URL         : https://dashboard.lesgarssympas.com
PM2         : dashboard-lgs (user: lgs)
nginx       : reverse proxy 443 -> :3001
SSL         : Let's Encrypt (Certbot)
BDD         : Meme MySQL que le site principal
```

---

## STRUCTURE DU PROJET

```
/var/www/dashboard-lgs/
+-- src/
|   +-- app/                   <- Next.js App Router
|   |   +-- globals.css
|   |   +-- layout.tsx
|   |   +-- page.tsx
|   +-- components/
|   |   +-- ui/                <- shadcn/ui composants (21 fichiers)
|   +-- hooks/
|   |   +-- use-mobile.ts
|   +-- lib/
|       +-- prisma.ts          <- Singleton Prisma Client
|       +-- utils.ts           <- shadcn/ui utils
+-- prisma/
|   +-- schema.prisma          <- Schema complet (existant + nouveau)
|   +-- seed.ts                <- Admin seed (peter@lesgarssympas.com)
+-- ecosystem.config.js        <- PM2 config
+-- .env                       <- DATABASE_URL
+-- .env.local                 <- DATABASE_URL + NEXTAUTH_SECRET + NEXTAUTH_URL
+-- package.json
+-- CLAUDE.md
```

---

## MODELES PRISMA

### Existants (partages avec le site)
- **Team** : id, img, name, job, job2
- **Article** : id, language, title, description, type, content, contentImg, thumbnail, banner, statut, views, createdAt, updatedAt

### Nouveaux (Dashboard CMS)
- **User** : id, email, password (bcrypt), name, role
- **Page** : id, slug, type, status, createdAt, updatedAt -> contents[], seo[]
- **PageContent** : id, pageId, language, title, body (JSON Tiptap), updatedAt
- **PageSeo** : id, pageId, language, metaTitle, metaDescription, ogImage?, jsonLd?
- **Wedding** : id, slug, date, status, createdAt, updatedAt -> details[], media[]
- **WeddingContent** : id, weddingId, language, title, location, venue?, description, body?
- **WeddingMedia** : id, weddingId, type, url, thumbnail?, caption?, position, isCover
- **PricingPlan** : id, slug, price, isPopular, position, status -> contents[], features[]
- **PricingContent** : id, planId, language, name, subtitle?, description?
- **PricingFeature** : id, planId, language, text, included, position
- **SiteSetting** : id, key, value, group

### Enums
- PageType : SERVICE, GEO, LANDING, LEGAL, BLOG
- Status : DRAFT, PUBLISHED, ARCHIVED
- Language : fr, en
- MediaType : PHOTO, VIDEO, YOUTUBE

---

## REGLES OBLIGATOIRES

### 1. Deploiement & Git
```bash
cd /var/www/dashboard-lgs
npm run build && su - lgs -c 'pm2 restart dashboard-lgs'
```
Verifier : `curl -s -o /dev/null -w %{http_code} https://dashboard.lesgarssympas.com`

**Après chaque deploy réussi, TOUJOURS push sur GitHub :**
```bash
cd /var/www/dashboard-lgs && git add -A && git commit -m "description" && git push
```
**Le repo GitHub (Pitkaine/dashboard-lgs) doit TOUJOURS refléter le code en production.**

### 2. BDD partagee
- **NE JAMAIS** modifier les modeles Team et Article sans verifier la compatibilite avec le site principal
- Apres modification du schema : `npx prisma db push`
- Le site principal (/var/www/lesgarssympas/) doit aussi regenerer son client : `npx prisma generate`

### 3. Securite
- Toutes les routes sauf /login sont protegees par NextAuth middleware
- Les API routes verifient la session avant toute operation
- Les mots de passe sont hashes avec bcrypt (12 rounds)
- Ne JAMAIS exposer NEXTAUTH_SECRET ou DATABASE_URL

### 4. Style
- shadcn/ui pour tous les composants UI
- Tailwind CSS uniquement
- Sidebar sombre (#1a1a2e), contenu clair
- Responsive

---

## MODULES A IMPLEMENTER

| Phase | Module | Statut |
|-------|--------|--------|
| D.0 | Setup projet + dependances | FAIT |
| D.1 | Auth + Layout sidebar | A FAIRE |
| D.2 | Editeur Tiptap + Pages | A FAIRE |
| D.3 | Blog (migration Tiptap) | A FAIRE |
| D.4 | Portfolio | A FAIRE |
| D.5 | Tarifs | A FAIRE |
| D.6 | Pages geographiques | A FAIRE |
| D.7 | Equipe + Parametres | A FAIRE |
| D.8 | Integration site <-> dashboard | A FAIRE |

---

## JOURNAL DES MODIFICATIONS

| Date | Action |
|------|--------|
| 2026-03-02 | D.0 - Setup initial : Next.js 16, Tailwind v4, shadcn/ui (21 composants), Prisma 6 (13 nouveaux modeles), NextAuth, Tiptap, PM2, admin seed |

> **Derniere mise a jour : 2 mars 2026**
