---
description: Setup and run Coolify locally
---

1. **Prerequisites**
   - Ensure Docker Desktop is installed and running on your Windows machine.
   - Ensure you have sufficient RAM (minimum 4GB) and disk space.

2. **Create a directory for Coolify**
   ```
   mkdir C:\coolify && cd C:\coolify
   ```

3. **Create `docker-compose.yml`**
   ```yaml
   version: "3"
   services:
     coolify:
       image: coollabsio/coolify:latest
       container_name: coolify
       restart: unless-stopped
       ports:
         - "3000:3000"
       environment:
         - DB_CONNECTION=sqlite
         - DB_DATABASE=/data/database.sqlite
         - APP_URL=http://localhost:3000
       volumes:
         - C:/coolify/data:/data
   ```

4. **Start Coolify**
   ```
   docker compose up -d
   ```
   This will pull the Coolify image and start the server on `http://localhost:3000`.

5. **Access Coolify UI**
   - Open your browser and navigate to `http://localhost:3000`.
   - Follow the initial setup wizard to create an admin account.

6. **Deploy your iProduct-Repair app**
   - In the Coolify dashboard, click **Add New Project**.
   - Choose **Git Repository** and provide the path to your local repository:
     `C:/Users/harsh/OneDrive/Documents/GitHub/iProduct-Repair`.
   - Configure the build settings:
     - **Framework**: Next.js
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start` (or `npm run dev` for development)
   - Save and trigger a deployment.

7. **Verify**
   - Once deployed, Coolify will expose your app at a generated URL (e.g., `https://your-project.coolify.app`).
   - Ensure the app loads correctly.

**Notes**
- If you encounter permission issues with the `C:/coolify/data` volume, adjust the folder permissions to allow Docker to read/write.
- To stop Coolify, run `docker compose down` inside `C:\coolify`.
