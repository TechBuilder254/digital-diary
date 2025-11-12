# Digital Diary – Docker Quickstart

Follow these steps to run the project on any machine (Windows, macOS, Linux) using Docker.

1. **Install prerequisites**
   - Docker Desktop (Windows/macOS) or Docker Engine (Linux)
   - Git

2. **Clone the repository**
   ```bash
   git clone https://github.com/<your-org>/digital-diary.git
   cd digital-diary
   ```

3. **Create environment file**
   - Duplicate `.env.example` to `.env`
   - Fill in the required Supabase variables:
     ```
     SUPABASE_URL=...
     SUPABASE_SERVICE_ROLE_KEY=...
     SUPABASE_ANON_KEY=...
     ```

4. **Build and start containers**
   ```bash
   ./scripts/run-with-docker.sh --build
   ```
   - Script stops old containers, builds fresh images, opens `http://localhost:3000`, then tails logs.
   - You can rerun without `--build` for faster starts.

5. **Stop containers when finished**
   ```bash
   docker compose down
   ```

6. **Rebuild only when dependencies change**
   ```bash
   docker compose up --build api
   docker compose up --build frontend
   ```
   *(Skip `--build` for normal restarts: `docker compose up`.)*

