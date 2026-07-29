#!/usr/bin/env python3
"""Add SUPABASE_SERVICE_ROLE_KEY to Vercel and remove the leaked NEXT_PUBLIC_ version"""
import re, json, urllib.request, os, subprocess

# Read the key from .env.local (full key is there, only terminal display is redacted)
with open('/root/plumbcore-ai/.env.local') as f:
    env_local = f.read()

m = re.search(r'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE\s*[=:]\s*"([^"]+)"', env_local)
if not m:
    m = re.search(r'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE\s*=\s*(\S+)', env_local)
if not m:
    print("ERROR: Could not find SERVICE_ROLE key in .env.local")
    exit(1)

key_value = m.group(1).strip().strip('"\'')
print(f"Key found: {len(key_value)} chars")

# Read Vercel token
with open('/root/.vercel/token') as f:
    token = f.read().strip()

# Get the Vercel project ID/team
team_id = "alfredkenway1971-designs-projects"
project_id = None

# List projects to find the right one
req = urllib.request.Request(f"https://api.vercel.com/v9/projects")
req.add_header('Authorization', f'Bearer {token}')
try:
    resp = urllib.request.urlopen(req, timeout=10)
    projects = json.loads(resp.read()).get('projects', [])
    for p in projects:
        if 'plumbcore' in p.get('name', '').lower() or 'plumbcore' in p.get('directoryListing', ''):
            project_id = p['id']
            print(f"Found project: {p['name']} (id: {project_id})")
            break
    if not project_id:
        print("Projects:", [p['name'] for p in projects[:10]])
except Exception as e:
    print(f"Error listing projects: {e}")
    # Try with team ID
    try:
        req = urllib.request.Request(f"https://api.vercel.com/v9/projects?teamId={team_id}")
        req.add_header('Authorization', f'Bearer {token}')
        resp = urllib.request.urlopen(req, timeout=10)
        projects = json.loads(resp.read()).get('projects', [])
        for p in projects:
            if 'plumbcore' in p.get('name', '').lower():
                project_id = p['id']
                print(f"Found project with team: {p['name']} (id: {project_id})")
                break
    except Exception as e2:
        print(f"Error with team: {e2}")

if not project_id:
    print("Could not find project - will try direct project name")
    project_id = "plumbcore-ai"  # try the most likely name
PYEOF