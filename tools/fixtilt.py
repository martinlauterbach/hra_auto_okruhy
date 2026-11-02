import math,re
s=0.07; c=math.sqrt(1-s*s)
Rinv=[[1,0,0],[0,c,s],[0,-s,c]]   # Rx(-theta)
out=[]; fixed=0
for line in open('1496-1.mpd').read().splitlines():
    t=line.split()
    if len(t)>=15 and t[0]=='1':
        part=' '.join(t[14:]).lower()
        m=[float(x) for x in t[5:14]]
        R=[m[0:3],m[3:6],m[6:9]]
        tilted=any(abs(abs(v)-0.07)<0.0015 for v in m)
        if tilted and not part.startswith(('3641','4624')):
            R0=[[sum(Rinv[i][k]*R[k][j] for k in range(3)) for j in range(3)] for i in range(3)]
            R0=[[round(v) if abs(v-round(v))<0.004 else round(v,6) for v in row] for row in R0]
            t[5:14]=[('%g'%v) for row in R0 for v in row]; fixed+=1
        line=' '.join(t)
    out.append(line)
open('car_fixed.mpd','w').write('\n'.join(out)+'\n')
print('fixed',fixed)
for l in out:
    if l.startswith('1 ') and ('3710' in l or '3626' in l or '4212' in l): print(l)
