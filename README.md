### INSTALL

npm install tailwind-variants
npm install -D tailwindcss-animate
npm i tailwind-merge
npm i --save-dev @types/node
npm install nodemailer
npm i @types/nodemailer
npm i ws
npm i --save-dev @types/ws
npm install prisma --save-dev
npm install better-auth

### COMMANDS

- npx prisma init
- npm run db:push
  prisma generate -> client upt.
  prisma db push
- npx prisma migrate dev --name init
  npx prisma migrate deploy

### PACKAGES

- AUTH -> betterauth
- VALIDATION -> zod
- UI -> tailwind[tailwindcss-animate,tailwind-variants],shadcn,lucide
- WEBSOCKET -> WS
- ORM -> prisma[sqlite]
- OTHER -> node-mailer

### CHECK

- event emitter,SSE - server sent event,

### ShadCn json

```json
{
	"$schema": "https://next.shadcn-svelte.com/schema.json",
	"style": "new-york",
	"tailwind": {
		"config": "tailwind.config.ts",
		"css": "src/app.css",
		"baseColor": "slate"
	},
	"aliases": {
		"components": "$lib/components/ui",
		"utils": "$lib/components/ui/utils",
		"ui": "$lib/components/ui",
		"hooks": "$lib/components/ui"
	},
	"typescript": true,
	"registry": "https://next.shadcn-svelte.com/registry"
}
```

### Css core

```css
@import url('https://fonts.googleapis.com/css2?family=Indie+Flower&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap');
@import 'tailwindcss';

@custom-variant dark (&: where(.dark, .dark _));
@layer base {
	::after,
	::before,
	::backdrop,
	::file-selector-button {
		border-color: var(--color-gray-200, currentColor);
	}
}
@layer base {
	:root {
		--background: 0 0% 100%;
		--foreground: 222.2 84% 4.9%;
		--card: 0 0% 100%;
		--card-foreground: 222.2 84% 4.9%;
		--popover: 0 0% 100%;
		--popover-foreground: 222.2 84% 4.9%;
		--primary: 222.2 47.4% 11.2%;
		--primary-foreground: 210 40% 98%;
		--secondary: 210 40% 96.1%;
		--secondary-foreground: 222.2 47.4% 11.2%;
		--muted: 210 40% 96.1%;
		--muted-foreground: 215.4 16.3% 46.9%;
		--accent: 210 40% 96.1%;
		--accent-foreground: 222.2 47.4% 11.2%;
		--destructive: 0 72.22% 50.59%;
		--destructive-foreground: 210 40% 98%;
		--border: 214.3 31.8% 91.4%;
		--input: 214.3 31.8% 91.4%;
		--ring: 222.2 84% 4.9%;
		--radius: 0.5rem;
	}
	.dark {
		--background: 222.2 84% 4.9%;
		--foreground: 210 40% 98%;
		--card: 222.2 84% 4.9%;
		--card-foreground: 210 40% 98%;
		--popover: 222.2 84% 4.9%;
		--popover-foreground: 210 40% 98%;
		--primary: 210 40% 98%;
		--primary-foreground: 222.2 47.4% 11.2%;
		--secondary: 217.2 32.6% 17.5%;
		--secondary-foreground: 210 40% 98%;
		--muted: 217.2 32.6% 17.5%;
		--muted-foreground: 215 20.2% 65.1%;
		--accent: 217.2 32.6% 17.5%;
		--accent-foreground: 210 40% 98%;
		--destructive: 0 62.8% 30.6%;
		--destructive-foreground: 210 40% 98%;
		--border: 217.2 32.6% 17.5%;
		--input: 217.2 32.6% 17.5%;
		--ring: 212.7 26.8% 83.9%;
	}
}

/* SHADCN COLORS */
@theme inline {
	--font-sans:
		'Inter Variable', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
		'Segoe UI Symbol', 'Noto Color Emoji';
	--font-mono:
		'Source Code Pro Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
		'Liberation Mono', 'Courier New', monospace;

	/* Colors */
	--color-border: hsl(var(--border));
	--color-input: hsl(var(--input));
	--color-ring: hsl(var(--ring));
	--color-background: hsl(var(--background));
	--color-foreground: hsl(var(--foreground));
	--color-primary: hsl(var(--primary));
	--color-primary-foreground: hsl(var(--primary-foreground));
	--color-secondary: hsl(var(--secondary));
	--color-secondary-foreground: hsl(var(--secondary-foreground));
	--color-destructive: hsl(var(--destructive));
	--color-destructive-foreground: hsl(var(--destructive-foreground));
	--color-caution: var(--color-red-500);
	--color-warning: var(--color-amber-500);
	--color-info: var(--color-sky-500);
	--color-muted: hsl(var(--muted));
	--color-muted-foreground: hsl(var(--muted-foreground));
	--color-accent: hsl(var(--accent));
	--color-accent-foreground: hsl(var(--accent-foreground));
	--color-popover: hsl(var(--popover));
	--color-popover-foreground: hsl(var(--popover-foreground));
	--color-card: hsl(var(--card));
	--color-card-foreground: hsl(var(--card-foreground));
	--color-sidebar: hsl(var(--sidebar-background));
	--color-sidebar-foreground: hsl(var(--sidebar-foreground));
	--color-sidebar-primary: hsl(var(--sidebar-primary));
	--color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
	--color-sidebar-accent: hsl(var(--sidebar-accent));
	--color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
	--color-sidebar-border: hsl(var(--sidebar-border));
	--color-sidebar-ring: hsl(var(--sidebar-ring));

	/* Border */
	--radius-xl: calc(var(--radius) + 4px);
	--radius-lg: var(--radius);
	--radius-md: calc(var(--radius) - 2px);
	--radius-sm: calc(var(--radius) - 4px);

	/* Animations */
	--animate-accordion-down: 0.2s ease-out accordion-down;
	--animate-accordion-up: 0.2s ease-out accordion-up;
	--animate-caret-blink: 1.25s ease-out infinite caret-blink;

	/* Keyframes */
	@keyframes accordion-down {
		from: {
			height: 0;
		}
		to: {
			height: var(--bits-accordion-content-height);
		}
	}
	@keyframes accordion-up {
		from: {
			height: var(--bits-accordion-content-height);
		}
		to: {
			height: 0;
		}
	}
	@keyframes caret-blink {
		0%,
		70%,
		100% {
			opacity: 1;
		}
		20%,
		50% {
			opacity: 0;
		}
	}
}

/* CUSTOM COLORS & FONTS */
@theme {
	/* default font set */
	--font-sans: 'Roboto Mono', monospace;
	/* custom colors and second font */
	--color-my-indigo: hsl(228, 96%, 89%);
	--color-my-emerald: hsl(141, 84%, 93%);
	--font-indie: 'Indie Flower', cursive;
}

@layer base {
	* {
		@apply border-border;
	}
	body {
		@apply bg-background text-foreground mx-auto;
	}
	button {
		@apply cursor-pointer;
	}
	a {
		@apply cursor-pointer;
	}
}
```

rm -rf node_modules/.prisma
rm -rf prisma/generated # ak tam máš výstup clienta
npm install
npx prisma generate
