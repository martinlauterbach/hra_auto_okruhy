import re, os, sys, urllib.request, concurrent.futures as cf
BASE='https://raw.githubusercontent.com/gkjohnson/ldraw-parts-library/master/complete/ldraw/'
LIB='lib'
os.makedirs(LIB, exist_ok=True)
def refs(text):
    out=[]
    for line in text.splitlines():
        t=line.strip().split()
        if len(t)>=15 and t[0]=='1':
            out.append(' '.join(t[14:]).replace('\\','/').lower())
    return out
mpd=open('1496-1.mpd').read()
local=set(m.lower() for m in re.findall(r'^0 FILE (.+)$', mpd, re.M))
local={x.strip() for x in local}
seen=set(); found={}; missing=[]
def fetch(name):
    for d in ['parts/','p/','models/']:
        url=BASE+d+name
        try:
            data=urllib.request.urlopen(url, timeout=20).read().decode('utf-8','replace')
            path=os.path.join(LIB,d,name); os.makedirs(os.path.dirname(path),exist_ok=True)
            open(path,'w').write(data); return name, d, data
        except Exception as e:
            continue
    return name, None, None
todo=[r for r in refs(mpd) if r not in local]
with cf.ThreadPoolExecutor(16) as ex:
    while todo:
        batch=[t for t in set(todo) if t not in seen]; todo=[]
        seen.update(batch)
        for name,d,data in ex.map(fetch,batch):
            if data is None: missing.append(name); continue
            found[name]=d
            todo+= [r for r in refs(data) if r not in seen]
urllib.request.urlretrieve(BASE+'LDConfig.ldr', os.path.join(LIB,'LDConfig.ldr'))
print('files',len(found),'missing',missing)
