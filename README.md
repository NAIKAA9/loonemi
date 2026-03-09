# Form Backend

## Local development

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set `MONGODB_URI` to your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
   ```
3. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```

## Vercel deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Log in and link the project:
   ```bash
   vercel login
   vercel link
   ```
3. Add `MONGODB_URI` in **Vercel Project Settings → Environment Variables**.
   Use your MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/dbname`).
4. Deploy to production:
   ```bash
   vercel --prod
   ```

## App live server (published Vercel link)

After deploy completes, Vercel prints the production URL. You can also list deployments and copy the latest live URL:

```bash
vercel ls
```

Example live link format:

`https://your-project-name.vercel.app`
