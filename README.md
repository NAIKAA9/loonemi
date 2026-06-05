# Form Backend

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
4. Deploy to production and publish the live link:
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


---

## Developer Profile
This repository is created and maintained by **[Eslavath Narasimha Naik](https://github.com/NAIKAA9)**.
- **GitHub**: [NAIKAA9](https://github.com/NAIKAA9)
- **LinkedIn**: [Narasimha Naik](https://www.linkedin.com/in/eslavathnarasimhanaik)

