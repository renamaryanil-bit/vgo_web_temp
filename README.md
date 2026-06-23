This website is a real-time distance tracker for a robot system. 
It makes use of supabase for the database, express for the api (using railway), and vercel for deployment.

In case of deploying from the beginning, proceed as follows:
1. Clone repo, or give appropriate access rights within this repo.
2. In supabase, create a new project, open SQL editor and run the schema that exists in the backend folder. This will create all the appropriate tables.
3. Find the url as well as the service key and make note. These are important environment variables.
4. Add .env to your local code and verify connections.
5. In railway, create new, import from github and connect the repo. Make sure the root directory is the backend folder and not the enitre repo. Add the environment variable you made note of earlier here.
6. For frontend deployment, make use of vercel. Once again, import from github and link this repo. Here, make sure root directory is the frontend folder. 
7. After deployment, visit the new website and verify.

Check API routes 
Check for port mismatch