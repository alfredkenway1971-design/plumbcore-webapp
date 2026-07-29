#!/usr/bin/env python3
"""Test Supabase connection and RLS fix"""
import re, json, urllib.request

with open('/root/plumbcore-ai/.env.prod') as f:
    env = f.read()

anon = re.search(r'ANON_KEY\s*[=:]\s*["\']?([^"\'\\s]+)', env)
key = anon.group(1) if anon else None

if not key:
    print("ERROR: Could not read anon key")
    exit(1)

url = "https://zwlwmehlewcyyljskpfv.supabase.co/rest/v1/profiles?select=id,role,company_id&limit=5"
req = urllib.request.Request(url)
req.add_header('apikey', key)
req.add_header('Authorization', f'Bearer {key}')

try:
    resp = urllib.request.urlopen(req, timeout=10)
    data = json.loads(resp.read())
    print(f"✅ Profiles query succeeded — {len(data)} rows")
    for p in data:
        cid = (p.get('company_id') or '')[:12]
        print(f"   id={p['id'][:8]}... role={p.get('role','?')} company={cid}...")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"❌ HTTP {e.code}: {body[:200]}")
except Exception as e:
    print(f"❌ Error: {e}")

# Also test clients table
url2 = "https://zwlwmehlewcyyljskpfv.supabase.co/rest/v1/clients?select=id,name,company_id&limit=5"
req2 = urllib.request.Request(url2)
req2.add_header('apikey', key)
req2.add_header('Authorization', f'Bearer {key}')

try:
    resp2 = urllib.request.urlopen(req2, timeout=10)
    data2 = json.loads(resp2.read())
    print(f"✅ Clients query succeeded — {len(data2)} rows")
    for c in data2:
        print(f"   {c.get('name','?')} (company: {c.get('company_id','?')[:12]}...)")
except urllib.error.HTTPError as e:
    body2 = e.read().decode()
    print(f"❌ Clients HTTP {e.code}: {body2[:200]}")
