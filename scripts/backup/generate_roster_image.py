import os
import urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

def create_roster():
    width, height = 2560, 1440
    # Base dark cybernetic background
    base = Image.new('RGB', (width, height), (8, 12, 20))
    draw = ImageDraw.Draw(base)

    # Draw subtle background grid or glowing lines
    for x in range(0, width, 80):
        draw.line([(x, 0), (x, height)], fill=(15, 23, 40), width=1)
    for y in range(0, height, 80):
        draw.line([(0, y), (width, y)], fill=(15, 23, 40), width=1)

    # Header decoration
    draw.rectangle([(85, 40), (width - 85, 150)], fill=(15, 22, 36), outline=(0, 240, 255), width=2)
    draw.line([(85, 150), (width - 85, 150)], fill=(0, 255, 136), width=4)

    # Try loading fonts
    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 52)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 24)
        font_role = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18)
        font_name = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 26)
        font_dept = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 16)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_role = ImageFont.load_default()
        font_name = ImageFont.load_default()
        font_dept = ImageFont.load_default()

    # Header text
    draw.text((120, 60), "DSSA EXECUTIVE CORE COMMITTEE 2026 - 2027", fill=(255, 255, 255), font=font_title)
    draw.text((120, 115), "THE LEADERSHIP, TECHNICAL HEADS & VISIONARIES BEHIND THE DATA SCIENCE STUDENTS' ASSOCIATION", fill=(0, 240, 255), font=font_sub)

    import json
    import os

    json_path = "public/assets/data/core_committee_team.json"
    if not os.path.exists(json_path):
        json_path = "dist/assets/data/core_committee_team.json"
    
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            members = json.load(f)
    else:
        members = [
            {"role": "PRESIDENT", "name": "Aarav Sharma", "dept": "B.Tech Data Science · 4th Yr", "color": (0, 240, 255), "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80", "init": "AS"},
            {"role": "VICE PRESIDENT", "name": "Ananya Verma", "dept": "B.Tech AI & ML · 4th Yr", "color": (0, 240, 255), "url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80", "init": "AV"},
            {"role": "GENERAL SECRETARY", "name": "Rohan Mehta", "dept": "B.Tech Data Science · 3rd Yr", "color": (183, 108, 253), "url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80", "init": "RM"},
            {"role": "TREASURER", "name": "Priya Nair", "dept": "B.Tech Data Science · 3rd Yr", "color": (255, 170, 0), "url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80", "init": "PN"},
            {"role": "TECHNICAL HEAD", "name": "Vikramaditya Rao", "dept": "B.Tech AI & ML · 4th Yr", "color": (0, 255, 136), "url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80", "init": "VR"},
            {"role": "CO-TECHNICAL HEAD", "name": "Siddharth Joshi", "dept": "B.Tech Comp Sci · 3rd Yr", "color": (0, 255, 136), "url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80", "init": "SJ"},
            {"role": "EVENTS HEAD", "name": "Neha Gupta", "dept": "B.Tech Data Science · 3rd Yr", "color": (255, 68, 119), "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80", "init": "NG"},
            {"role": "PR & OUTREACH HEAD", "name": "Karan Singhania", "dept": "B.Tech AI & ML · 3rd Yr", "color": (56, 182, 255), "url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80", "init": "KS"},
            {"role": "CREATIVE HEAD", "name": "Riya Mukherjee", "dept": "B.Des / Data Science · 3rd Yr", "color": (255, 102, 204), "url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80", "init": "RM"},
            {"role": "EDITORIAL HEAD", "name": "Aditya Kulkarni", "dept": "B.Tech Data Science · 3rd Yr", "color": (162, 136, 255), "url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80", "init": "AK"},
            {"role": "MEDIA HEAD", "name": "Snigdha Chatterjee", "dept": "B.Tech AI & ML · 2nd Yr", "color": (255, 136, 68), "url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80", "init": "SC"},
            {"role": "LOGISTICS HEAD", "name": "Devansh Patel", "dept": "B.Tech Data Science · 2nd Yr", "color": (0, 212, 255), "url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80", "init": "DP"},
            {"role": "RESEARCH LEAD", "name": "Tanvi Deshmukh", "dept": "B.Tech AI & ML · 4th Yr", "color": (0, 255, 204), "url": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80", "init": "TD"},
            {"role": "COMMUNITY LEAD", "name": "Arjun Nair", "dept": "B.Tech Comp Sci · 2nd Yr", "color": (119, 170, 255), "url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80", "init": "AN"}
        ]
        
    colors_palette = [
        (0, 240, 255), (0, 255, 136), (255, 170, 0), (255, 68, 119),
        (183, 108, 253), (56, 182, 255), (0, 255, 204), (255, 102, 204),
        (255, 136, 68), (162, 136, 255), (0, 212, 255), (119, 170, 255)
    ]
    for idx, member in enumerate(members):
        if "color" not in member:
            member["color"] = colors_palette[idx % len(colors_palette)]
        elif isinstance(member["color"], list):
            member["color"] = tuple(member["color"])

    card_w, card_h = 320, 530
    gap_x, gap_y = 25, 45
    start_x = (width - (7 * card_w + 6 * gap_x)) // 2
    start_y_row1 = 200
    start_y_row2 = start_y_row1 + card_h + gap_y

    os.makedirs("public/media", exist_ok=True)
    os.makedirs("dist/media", exist_ok=True)
    cache_dir = "scripts/.photo_cache"
    os.makedirs(cache_dir, exist_ok=True)

    for i, m in enumerate(members):
        row = i // 7
        col = i % 7
        cx = start_x + col * (card_w + gap_x)
        cy = (start_y_row1 if row == 0 else start_y_row2)

        # Card box
        draw.rectangle([(cx, cy), (cx + card_w, cy + card_h)], fill=(16, 24, 38), outline=m["color"], width=2)
        
        # Photo box
        photo_w, photo_h = card_w - 20, 340
        px, py = cx + 10, cy + 10

        # Load photo from cache or url
        photo_img = None
        photo_path = m.get("photo") or m.get("url", "")
        try:
            if photo_path.startswith("http://") or photo_path.startswith("https://"):
                cache_file = os.path.join(cache_dir, f"photo_{i}.jpg")
                if not os.path.exists(cache_file):
                    req = urllib.request.Request(photo_path, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=4) as resp, open(cache_file, 'wb') as out:
                        out.write(resp.read())
                p_open = Image.open(cache_file).convert('RGB')
            else:
                p_open = Image.open(photo_path).convert('RGB')
            
            photo_img = ImageOps.fit(p_open, (photo_w, photo_h), Image.Resampling.LANCZOS)
        except Exception as e:
            print(f"Could not load photo {i}: {e}")

        if photo_img:
            base.paste(photo_img, (px, py))
        else:
            # Fallback avatar graphic
            draw.rectangle([(px, py), (px + photo_w, py + photo_h)], fill=(20, 32, 50))
            draw.ellipse([(px + photo_w//2 - 50, py + photo_h//2 - 50), (px + photo_w//2 + 50, py + photo_h//2 + 50)], outline=m["color"], width=3)
            try:
                font_init = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 40)
            except Exception:
                font_init = font_title
            
            init_char = m.get("init", m.get("name", "?")[0].upper())
            draw.text((px + photo_w//2 - 25, py + photo_h//2 - 25), init_char, fill=m["color"], font=font_init)

        # Bottom text details
        ty = cy + 365
        
        def draw_truncated(draw_obj, pos, txt, fill_col, fnt, max_w):
            if not txt: return
            w = fnt.getlength(txt) if hasattr(fnt, 'getlength') else fnt.getbbox(txt)[2]
            if w <= max_w:
                draw_obj.text(pos, txt, fill=fill_col, font=fnt)
                return
            for i in range(len(txt), 0, -1):
                t = txt[:i] + "..."
                tw = fnt.getlength(t) if hasattr(fnt, 'getlength') else fnt.getbbox(t)[2]
                if tw <= max_w:
                    draw_obj.text(pos, t, fill=fill_col, font=fnt)
                    return

        draw_truncated(draw, (cx + 16, ty), m.get("role", ""), m["color"], font_role, card_w - 32)
        
        name_txt = m.get("name", "")
        if len(name_txt) > 23:
            name_txt = name_txt[:21] + "..."
            
        draw_truncated(draw, (cx + 16, ty + 30), name_txt, (255, 255, 255), font_name, card_w - 32)
        draw_truncated(draw, (cx + 16, ty + 70), m.get("dept", ""), (148, 163, 184), font_dept, card_w - 32)

        # Decorative line
        draw.line([(cx + 16, ty + 110), (cx + card_w - 16, ty + 110)], fill=(0, 240, 255), width=1)

    out_public = "public/media/core-committee-roster.jpg"
    out_dist = "dist/media/core-committee-roster.jpg"
    base.save(out_public, "JPEG", quality=92)
    base.save(out_dist, "JPEG", quality=92)
    print(f"Successfully generated 2560x1440 Core Committee Roster image to {out_public} and {out_dist}")

if __name__ == "__main__":
    create_roster()
