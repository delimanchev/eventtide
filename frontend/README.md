# EventTide frontend

Vmesnik v Reactu in Vite za pregled javnih dogodkov, prijavo na dogodke in upravljanje prijav. Organizatorji in administratorji imajo svoja orodja v pogledu **Moj račun**.

## Lokalni zagon

Najprej pripravi podatkovno bazo in zaženi backend po [navodilih za lokalni zagon](../README.md#lokalni-zagon). Nato iz mape `frontend` zaženi:

```bash
npm ci
npm run dev
```

Odpri naslov, ki ga izpiše Vite. Privzeto je [http://localhost:5173](http://localhost:5173).

Frontend privzeto uporablja API na `http://localhost:3001`. Če backend posluša drugje, nastavi `VITE_API_URL` v datoteki `frontend/.env.local` in ponovno zaženi Vite. Vrednost uporabi brez zaključne poševnice. Če spremeniš naslov frontenda, nastavi tudi `FRONTEND_URL` v `backend/.env` in ponovno zaženi backend.

## Preverjanje

```bash
npm run lint
npm run build
```

Gradnja ustvari mapo `dist/`.
