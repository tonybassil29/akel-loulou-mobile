"""
Illustrations d'ingredients, dessinees ici, donc libres de tout droit tiers.

Style commun : aplats doux, formes arrondies, aucune etiquette, aucun texte,
palette accordee au rose poudre de l'app. Fond transparent : les vignettes sont
posees sur une carte blanche.
"""
import cairosvg, os

SCR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(SCR, 'png'); os.makedirs(OUT, exist_ok=True)

def page(corps, defs=''):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<defs>
 <linearGradient id="verre" x1="0" y1="0" x2="1" y2="0">
   <stop offset="0" stop-color="#EDF3F6"/><stop offset=".45" stop-color="#FBFDFE"/><stop offset="1" stop-color="#D9E4EA"/>
 </linearGradient>
 <linearGradient id="ambre" x1="0" y1="0" x2="1" y2="0">
   <stop offset="0" stop-color="#B26B2A"/><stop offset=".45" stop-color="#D89446"/><stop offset="1" stop-color="#9E5B22"/>
 </linearGradient>
 <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
   <stop offset="0" stop-color="#C3CED6"/><stop offset=".4" stop-color="#EFF4F7"/><stop offset="1" stop-color="#AEBBC4"/>
 </linearGradient>
 <linearGradient id="creme" x1="0" y1="0" x2="1" y2="0">
   <stop offset="0" stop-color="#F3E7D8"/><stop offset=".45" stop-color="#FFFBF5"/><stop offset="1" stop-color="#E9D9C6"/>
 </linearGradient>
 <linearGradient id="rose" x1="0" y1="0" x2="1" y2="1">
   <stop offset="0" stop-color="#FF8FB6"/><stop offset="1" stop-color="#FF6B9D"/>
 </linearGradient>
 {defs}
</defs>
{corps}
</svg>'''

def bouteille(liquide, bouchon, extra=''):
    return page(f'''
  <rect x="228" y="70" width="56" height="52" rx="10" fill="{bouchon}"/>
  <rect x="236" y="112" width="40" height="34" fill="#C9D4DB"/>
  <path d="M168 168 q0-30 34-34 h108 q34 4 34 34 v230 q0 32-32 32 H200 q-32 0-32-32 Z" fill="url(#verre)"/>
  <path d="M182 196 q0-14 16-16 h116 q16 2 16 16 v198 q0 20-20 20 H202 q-20 0-20-20 Z" fill="{liquide}"/>
  <rect x="196" y="214" width="16" height="160" rx="8" fill="#FFFFFF" opacity=".28"/>
  {extra}''')

def sachet(corps_couleur, accent, motif=''):
    dents = ''.join(f'<path d="M{150+i*26} 124 l13 -16 l13 16 Z" fill="{corps_couleur}"/>' for i in range(8))
    return page(f'''
  {dents}
  <rect x="150" y="120" width="212" height="272" rx="16" fill="{corps_couleur}"/>
  <rect x="150" y="120" width="212" height="272" rx="16" fill="url(#verre)" opacity=".18"/>
  <rect x="172" y="206" width="168" height="10" rx="5" fill="{accent}" opacity=".85"/>
  <rect x="172" y="232" width="118" height="10" rx="5" fill="{accent}" opacity=".45"/>
  {motif}''')

def gousse(x, y, r):
    return (f'<g transform="translate({x},{y}) rotate({r})">'
            f'<path d="M0 0 q14 46 4 104 q-2 14-12 14 q-10 0-12-14 q-10-58 4-104 Z" fill="#4A3428"/>'
            f'<path d="M-2 14 q8 40 2 82" stroke="#6B4E36" stroke-width="3" fill="none" opacity=".8"/></g>')

def pois(cx, cy, r, c1, c2, rangs):
    out = []
    for (dx, dy, rr) in rangs:
        out.append(f'<circle cx="{cx+dx}" cy="{cy+dy}" r="{rr}" fill="{c1}"/>')
        out.append(f'<circle cx="{cx+dx-rr*0.3:.0f}" cy="{cy+dy-rr*0.3:.0f}" r="{rr*0.38:.0f}" fill="{c2}" opacity=".55"/>')
    return ''.join(out)

RANGS = [(-70,40,26),(-20,52,28),(34,44,26),(78,56,24),(-46,-4,25),(4,6,27),(56,0,25),(-12,-44,24),(40,-40,23),(-58,-46,20),(86,-16,20)]

# --- bol generique, pour les vrac ---
def bol(contenu):
    return page(f'''
  {contenu}
  <path d="M96 288 h320 q-16 116-160 116 Q112 404 96 288 Z" fill="#F4E9E0"/>
  <path d="M96 288 h320 q-4 28-16 50 H112 q-12-22-16-50 Z" fill="#E8D9CC"/>
  <ellipse cx="256" cy="288" rx="160" ry="26" fill="#FFF6EF"/>''')

images = {}

# 1. Arome vanille : flacon ambre + gousse
images['arome-vanille'] = bouteille('url(#ambre)', '#3E2C1E', gousse(360, 250, 14) + gousse(392, 276, -9))

# 2. Eau de fleur d'oranger : flacon clair + fleur
fleur = ''.join(f'<ellipse cx="{372+18*__import__("math").cos(a)}" cy="{242+18*__import__("math").sin(a)}" rx="15" ry="11" fill="#FFF4F8" transform="rotate({a*57.3:.0f} 372 242)"/>' for a in [0,1.26,2.51,3.77,5.03])
images['eau-fleur-oranger'] = bouteille('#FBF3E2', '#C9A24B', fleur + '<circle cx="372" cy="242" r="10" fill="#F2B24A"/>')

# 3. Sauce soja : flacon sombre, bouchon liege, aucune etiquette
images['sauce-soja'] = bouteille('#3A2118', '#B98A50')

# 4. Levure chimique : sachet creme, bande rose
images['levure'] = sachet('#FBEFE2', '#FF6B9D')

# 5. Sucre vanille : sachet ivoire + gousses
images['sucre-vanille'] = sachet('#FFF6E8', '#D9A441', gousse(268, 250, 6) + gousse(300, 262, 12))

# 6. Petits pois en conserve : boite metal ouverte + pois
images['petits-pois'] = page(f'''
  <path d="M138 176 h236 v212 q0 28-28 28 H166 q-28 0-28-28 Z" fill="url(#metal)"/>
  <ellipse cx="256" cy="176" rx="118" ry="30" fill="#EAF1F5"/>
  <ellipse cx="256" cy="176" rx="100" ry="22" fill="#6E9F58"/>
  {pois(256, 170, 0, '#8CBF6E', '#B9DCA0', [(-56,6,20),(-16,-2,22),(30,4,20),(68,-2,18),(-36,-20,17),(8,-24,18),(50,-22,16)])}
  <rect x="138" y="232" width="236" height="10" fill="#FFFFFF" opacity=".35"/>
  <rect x="138" y="330" width="236" height="10" fill="#FFFFFF" opacity=".25"/>''')

# 7. Pickles : bocal en verre + cornichons
corni = ''.join(f'<g transform="translate({206+i*36},{258+(i%2)*26}) rotate({-14+i*11})">'
                f'<rect x="-13" y="-58" width="26" height="116" rx="13" fill="#6E8B3D"/>'
                f'<rect x="-6" y="-48" width="6" height="96" rx="3" fill="#8FAE58" opacity=".8"/></g>' for i in range(4))
images['pickles'] = page(f'''
  <rect x="150" y="104" width="212" height="46" rx="12" fill="#C9A24B"/>
  <path d="M158 150 h196 q22 0 22 26 v210 q0 34-34 34 H170 q-34 0-34-34 V176 q0-26 22-26 Z" fill="url(#verre)"/>
  <clipPath id="cj"><path d="M158 150 h196 q22 0 22 26 v210 q0 34-34 34 H170 q-34 0-34-34 V176 q0-26 22-26 Z"/></clipPath>
  <g clip-path="url(#cj)"><rect x="130" y="150" width="252" height="270" fill="#D7E4B8" opacity=".55"/>{corni}</g>
  <rect x="176" y="182" width="16" height="190" rx="8" fill="#FFFFFF" opacity=".45"/>''')

# 8. Pois chiches en conserve : bol de pois chiches
images['pois-chiches'] = bol(pois(256, 200, 0, '#D9B87C', '#F0DBB4', RANGS))

# 9. Lentilles corail : bol de lentilles
LENT = [(dx, dy, 11) for dx, dy, _ in RANGS] + [(-34,22,11),(22,30,11),(66,26,11),(-84,10,10),(100,34,10),(-4,-18,11),(48,-16,11)]
images['lentilles-corail'] = bol(pois(256, 214, 0, '#E8873C', '#F7B378', LENT))

# 10. Creme liquide : brique creme, sans etiquette
images['creme'] = page('''
  <path d="M170 150 l86 -44 l86 44 v212 q0 34-34 34 H204 q-34 0-34-34 Z" fill="url(#creme)"/>
  <path d="M170 150 l86 -44 l86 44 l-86 30 Z" fill="#F0E2D0"/>
  <rect x="200" y="232" width="112" height="14" rx="7" fill="#FF6B9D" opacity=".55"/>
  <rect x="200" y="262" width="76" height="12" rx="6" fill="#E3D2BE"/>
  <rect x="192" y="176" width="14" height="190" rx="7" fill="#FFFFFF" opacity=".55"/>''')

# 11. Creme fraiche : pot ouvert + volute
images['creme-fraiche'] = page('''
  <path d="M148 196 h216 l-20 190 q-3 30-33 30 H201 q-30 0-33-30 Z" fill="url(#creme)"/>
  <ellipse cx="256" cy="196" rx="108" ry="28" fill="#FFFBF5"/>
  <path d="M256 128 q42 6 42 34 q0 20-22 26 q26 6 26 26 q0 22-46 22 q-46 0-46-22 q0-20 26-26 q-22-6-22-26 q0-28 42-34 Z" fill="#FFFFFF"/>
  <ellipse cx="256" cy="196" rx="84" ry="18" fill="#FFFFFF" opacity=".9"/>
  <rect x="176" y="240" width="14" height="130" rx="7" fill="#FFFFFF" opacity=".5"/>''')

# 12. Lait de coco : demi-noix + eclaboussure
images['lait-coco'] = page('''
  <path d="M110 250 a146 146 0 0 1 292 0 Z" fill="#7A5230"/>
  <path d="M132 250 a124 124 0 0 1 248 0 Z" fill="#FFFFFF"/>
  <path d="M110 250 h292 q0 96-146 96 Q110 346 110 250 Z" fill="#8C6039"/>
  <ellipse cx="256" cy="250" rx="146" ry="26" fill="#FFF9F2"/>
  <ellipse cx="256" cy="250" rx="112" ry="18" fill="#FFFFFF"/>
  <path d="M196 366 q60 34 120 0 q-8 44-60 44 q-52 0-60-44 Z" fill="#FFFDFA" opacity=".9"/>''')

# 13. Oeufs : deux oeufs bruns
images['oeufs'] = page('''
  <ellipse cx="206" cy="270" rx="78" ry="98" fill="#E2A977"/>
  <ellipse cx="186" cy="238" rx="30" ry="40" fill="#F3CCA6" opacity=".7"/>
  <ellipse cx="318" cy="292" rx="72" ry="92" fill="#D89C68"/>
  <ellipse cx="300" cy="262" rx="26" ry="36" fill="#EFC49C" opacity=".65"/>''')

# 14. Barre chocolatee, aucune marque
images['barre-chocolat'] = page('''
  <rect x="96" y="212" width="320" height="92" rx="24" fill="#5A3620"/>
  <rect x="96" y="212" width="320" height="34" rx="17" fill="#6E4429"/>
  <g fill="#48291759" opacity=".5">
    <rect x="132" y="236" width="36" height="46" rx="12"/><rect x="186" y="236" width="36" height="46" rx="12"/>
    <rect x="240" y="236" width="36" height="46" rx="12"/><rect x="294" y="236" width="36" height="46" rx="12"/>
    <rect x="348" y="236" width="36" height="46" rx="12"/>
  </g>
  <rect x="120" y="222" width="180" height="10" rx="5" fill="#FFFFFF" opacity=".18"/>''')

for nom, svg in images.items():
    cairosvg.svg2png(bytestring=svg.encode(), write_to=f'{OUT}/{nom}.png',
                     output_width=512, output_height=512)
    print('  ', nom)
print(len(images), 'illustrations generees ->', OUT)
