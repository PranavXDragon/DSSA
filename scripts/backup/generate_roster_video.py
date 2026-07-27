import os
import numpy as np
import urllib.request
import imageio
from PIL import Image, ImageDraw, ImageFont, ImageOps

def generate_video():
    width, height = 1920, 1080
    fps = 20
    seconds_per_slide = 3.0
    transition_seconds = 0.5
    frames_per_slide = int(seconds_per_slide * fps)
    frames_transition = int(transition_seconds * fps)

    os.makedirs("public/media", exist_ok=True)
    os.makedirs("dist/media", exist_ok=True)
    cache_dir = "scripts/.photo_cache"
    os.makedirs(cache_dir, exist_ok=True)

    try:
        from generate_roster_image import create_roster
        print("Generating intro overview grid image...")
        create_roster()
    except Exception as e:
        print("Could not generate intro grid image:", e)

    # Try loading fonts
    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 64)
        font_name = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 46)
        font_div = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
        font_dept = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 26)
        font_bio = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 30)
        font_init = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 100)
    except Exception:
        font_title = font_name = font_div = font_dept = font_bio = font_init = ImageFont.load_default()

    json_path = "public/assets/data/core_committee_team.json"
    if not os.path.exists(json_path):
        json_path = "dist/assets/data/core_committee_team.json"
    
    if os.path.exists(json_path):
        import json
        with open(json_path, 'r', encoding='utf-8') as f:
            members = json.load(f)
    else:
        members = [
            {"role": "PRESIDENT", "name": "Aarav Sharma", "dept": "B.Tech Data Science · 4th Yr", "div": "EXECUTIVE DIVISION", "bio": "Leading the executive board, driving technical innovation across student chapters, and managing flagship data science initiatives.", "color": (0, 240, 255), "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80", "init": "AS"},
            {"role": "VICE PRESIDENT", "name": "Ananya Verma", "dept": "B.Tech AI & ML · 4th Yr", "div": "EXECUTIVE DIVISION", "bio": "Co-leading strategic planning, overseeing cross-departmental operations, and fostering industry partnerships for tech symposiums.", "color": (0, 240, 255), "url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80", "init": "AV"},
            {"role": "GENERAL SECRETARY", "name": "Rohan Mehta", "dept": "B.Tech Data Science · 3rd Yr", "div": "ADMINISTRATIVE DIVISION", "bio": "Managing official association records, coordinating executive council assemblies, and directing administrative workflows.", "color": (183, 108, 253), "url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80", "init": "RM"},
            {"role": "TREASURER", "name": "Priya Nair", "dept": "B.Tech Data Science · 3rd Yr", "div": "FINANCE DIVISION", "bio": "Overseeing financial allocation, budgeting for technical symposiums, and managing sponsorship funds and accounts.", "color": (255, 170, 0), "url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80", "init": "PN"},
            {"role": "TECHNICAL HEAD", "name": "Vikramaditya Rao", "dept": "B.Tech AI & ML · 4th Yr", "div": "TECHNICAL DIVISION", "bio": "Architecting DSSA core technical platforms, leading hackathons, and directing advanced AI/ML research workshops.", "color": (0, 255, 136), "url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80", "init": "VR"},
            {"role": "CO-TECHNICAL HEAD", "name": "Siddharth Joshi", "dept": "B.Tech Comp Sci · 3rd Yr", "div": "TECHNICAL DIVISION", "bio": "Co-directing software development teams, managing open-source repositories, and mentoring student developers.", "color": (0, 255, 136), "url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80", "init": "SJ"},
            {"role": "EVENTS HEAD", "name": "Neha Gupta", "dept": "B.Tech Data Science · 3rd Yr", "div": "OPERATIONS DIVISION", "bio": "Orchestrating university-wide tech fests, managing event logistics, and ensuring seamless execution of symposiums.", "color": (255, 68, 119), "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80", "init": "NG"},
            {"role": "PR & OUTREACH HEAD", "name": "Karan Singhania", "dept": "B.Tech AI & ML · 3rd Yr", "div": "OUTREACH DIVISION", "bio": "Spearheading public relations, managing corporate communications, and networking with tech speakers and sponsors.", "color": (56, 182, 255), "url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80", "init": "KS"},
            {"role": "CREATIVE HEAD", "name": "Riya Mukherjee", "dept": "B.Des / Data Science · 3rd Yr", "div": "CREATIVE DIVISION", "bio": "Directing visual branding, UI/UX design for DSSA digital assets, and designing futuristic themes for tech carnivals.", "color": (255, 102, 204), "url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80", "init": "RM"},
            {"role": "EDITORIAL HEAD", "name": "Aditya Kulkarni", "dept": "B.Tech Data Science · 3rd Yr", "div": "EDITORIAL DIVISION", "bio": "Curating technical newsletters, editing AI research publications, and documenting DSSA project milestones.", "color": (162, 136, 255), "url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80", "init": "AK"},
            {"role": "MEDIA HEAD", "name": "Snigdha Chatterjee", "dept": "B.Tech AI & ML · 2nd Yr", "div": "MEDIA DIVISION", "bio": "Driving digital media campaigns, producing video content, and expanding community engagement across social channels.", "color": (255, 136, 68), "url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80", "init": "SC"},
            {"role": "LOGISTICS HEAD", "name": "Devansh Patel", "dept": "B.Tech Data Science · 2nd Yr", "div": "LOGISTICS DIVISION", "bio": "Managing campus infrastructure, security protocols, and hardware/network setups for large-scale hackathons.", "color": (0, 212, 255), "url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80", "init": "DP"},
            {"role": "RESEARCH LEAD", "name": "Tanvi Deshmukh", "dept": "B.Tech AI & ML · 4th Yr", "div": "RESEARCH DIVISION", "bio": "Leading student research groups in generative AI, computer vision, and publishing papers in student technical journals.", "color": (0, 255, 204), "url": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&auto=format&fit=crop&q=80", "init": "TD"},
            {"role": "COMMUNITY LEAD", "name": "Arjun Nair", "dept": "B.Tech Comp Sci · 2nd Yr", "div": "COMMUNITY DIVISION", "bio": "Building student developer networks, organizing peer learning circles, and onboarding first-year data science enthusiasts.", "color": (119, 170, 255), "url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80", "init": "AN"}
        ]

    colors_palette = [
        (0, 240, 255), (0, 255, 136), (255, 170, 0), (255, 68, 119),
        (183, 108, 253), (56, 182, 255), (0, 255, 204), (255, 102, 204),
        (255, 136, 68), (162, 136, 255), (0, 212, 255), (119, 170, 255)
    ]
    for idx, member in enumerate(members):
        if "color" not in member or not member["color"]:
            member["color"] = colors_palette[idx % len(colors_palette)]
        elif isinstance(member["color"], list):
            member["color"] = tuple(member["color"])
        if "init" not in member or not member["init"]:
            parts = member.get("name", "").strip().split()
            if len(parts) >= 2:
                member["init"] = (parts[0][0] + parts[1][0]).upper()
            elif len(parts) == 1 and len(parts[0]) >= 2:
                member["init"] = parts[0][:2].upper()
            else:
                member["init"] = "DS"

    print("Generating 14 individual profile slide images...")
    slides_np = []
    
    for i, m in enumerate(members):
        base = Image.new('RGB', (width, height), (8, 12, 20))
        draw = ImageDraw.Draw(base)

        # Background grid and styling
        for x in range(0, width, 100):
            draw.line([(x, 0), (x, height)], fill=(15, 22, 35), width=1)
        for y in range(0, height, 100):
            draw.line([(0, y), (width, y)], fill=(15, 22, 35), width=1)

        # Outer cyber frame
        draw.rectangle([(30, 30), (width - 30, height - 30)], outline=(0, 240, 255), width=2)
        
        # Header bar
        draw.rectangle([(30, 30), (width - 30, 110)], fill=(13, 20, 34))
        draw.text((70, 50), "DSSA EXECUTIVE CORE COMMITTEE 2026 - 2027", fill=(255, 255, 255), font=font_div)
        draw.text((width - 320, 50), f"COUNCIL ROSTER : {i+1:02d} OF 14", fill=(0, 240, 255), font=font_div)
        draw.line([(30, 110), (width - 30, 110)], fill=(0, 240, 255), width=2)

        # Left Photo Box
        px, py, pw, ph = 80, 170, 600, 800
        draw.rectangle([(px, py), (px + pw, py + ph)], fill=(12, 18, 30), outline=m["color"], width=3)
        
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
                if os.path.exists(cache_file):
                    p_open = Image.open(cache_file).convert('RGB')
                    photo_img = ImageOps.fit(p_open, (pw - 20, ph - 70), Image.Resampling.LANCZOS)
            else:
                target = None
                for candidate in [photo_path, os.path.join("public", photo_path), os.path.join("dist", photo_path), os.path.join("public/assets/team", os.path.basename(photo_path)), os.path.join("assets_raw", os.path.basename(photo_path))]:
                    if os.path.exists(candidate):
                        target = candidate
                        break
                if target and os.path.exists(target):
                    p_open = Image.open(target).convert('RGB')
                    photo_img = ImageOps.fit(p_open, (pw - 20, ph - 70), Image.Resampling.LANCZOS)
        except Exception as e:
            pass

        if photo_img:
            base.paste(photo_img, (px + 10, py + 10))
        else:
            draw.rectangle([(px + 10, py + 10), (px + pw - 10, py + ph - 70)], fill=(20, 32, 50))
            draw.text((px + pw//2 - 60, py + ph//2 - 80), m["init"], fill=m["color"], font=font_init)

        # Photo footer status
        draw.rectangle([(px + 10, py + ph - 50), (px + pw - 10, py + ph - 10)], fill=(8, 12, 20))
        draw.text((px + 25, py + ph - 42), f"● ACTIVE LEADERSHIP ROLE : {i+1:02d} / 14", fill=m["color"], font=font_div)

        # Right Leadership Details Box
        rx, ry = 750, 200
        # Division
        draw.rectangle([(rx, ry), (rx + 320, ry + 40)], fill=(18, 28, 48), outline=m["color"], width=1)
        draw.text((rx + 15, ry + 8), m["div"], fill=m["color"], font=font_div)
        
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
        
        # Role Title
        draw_truncated(draw, (rx, ry + 70), m.get("role", ""), (255, 255, 255), font_title, 1100)
        
        # Member Name
        draw_truncated(draw, (rx, ry + 160), m.get("name", ""), (255, 68, 119), font_name, 1100)
        
        # Department
        draw_truncated(draw, (rx, ry + 230), m.get("dept", ""), (148, 163, 184), font_dept, 1100)
        
        # Cyber divider
        draw.line([(rx, ry + 285), (rx + 600, ry + 285)], fill=(0, 240, 255), width=2)

        # Bio text wrapping
        bio_words = m["bio"].split()
        lines = []
        cur_line = []
        for w in bio_words:
            cur_line.append(w)
            if len(" ".join(cur_line)) > 45:
                lines.append(" ".join(cur_line))
                cur_line = []
        if cur_line:
            lines.append(" ".join(cur_line))

        by = ry + 330
        for l in lines:
            draw.text((rx, by), l, fill=(226, 232, 240), font=font_bio)
            by += 45

        # Progress strip at bottom right
        strip_x = rx
        strip_y = 900
        strip_w = 1000
        seg_w = strip_w // 14
        for s in range(14):
            sx = strip_x + s * seg_w
            fill_c = m["color"] if s == i else (30, 45, 65)
            draw.rectangle([(sx + 2, strip_y), (sx + seg_w - 4, strip_y + 16)], fill=fill_c)
        draw.text((strip_x, strip_y - 30), "COUNCIL PROGRESSION MATRIX:", fill=(148, 163, 184), font=font_div)

        # Convert Pillow image to numpy RGB format
        slides_np.append(np.array(base))

    # Load backup collage image as an overview intro/outro frame if available
    collage_path = "public/media/core-committee-roster.jpg"
    if os.path.exists(collage_path):
        collage_img = Image.open(collage_path).convert('RGB')
        if collage_img.size != (width, height):
            collage_img = collage_img.resize((width, height), Image.Resampling.LANCZOS)
        slides_np.insert(0, np.array(collage_img))

    import time
    ts = int(time.time())
    out_tmp = f"public/media/tmp_roster_{ts}.mp4"
    out_public = f"public/media/core-committee-roster-{ts}.mp4"
    out_dist = f"dist/media/core-committee-roster-{ts}.mp4"
    
    print("Writing H.264 frames to MP4 video using imageio-ffmpeg...")
    writer = imageio.get_writer(out_tmp, fps=fps, codec='libx264', quality=8, macro_block_size=None)

    for i in range(len(slides_np)):
        current = slides_np[i].astype(np.float32)
        next_img = slides_np[(i + 1) % len(slides_np)].astype(np.float32)

        # Hold static slide
        current_uint8 = slides_np[i]
        for _ in range(frames_per_slide):
            writer.append_data(current_uint8)

        # Transition cross-fade to next slide
        for f in range(1, frames_transition + 1):
            alpha = f / float(frames_transition)
            blended = (current * (1.0 - alpha) + next_img * alpha).astype(np.uint8)
            writer.append_data(blended)

    writer.close()
    
    try:
        import subprocess
        import imageio_ffmpeg
        exe = imageio_ffmpeg.get_ffmpeg_exe()
        cmd = [exe, '-y', '-i', out_tmp, '-c', 'copy', '-movflags', '+faststart', out_public]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(out_public) and os.path.getsize(out_public) > 0:
            if os.path.exists("dist/media"):
                import shutil
                shutil.copy2(out_public, out_dist)
            if os.path.exists(out_tmp):
                os.remove(out_tmp)
            print(f"Successfully created H.264 faststart executive video: {out_public} ({os.path.getsize(out_public)} bytes)")

            import json
            for fpath in ['public/assets/data/cms_projects.json', 'dist/assets/data/cms_projects.json']:
                if os.path.exists(fpath):
                    with open(fpath, 'r', encoding='utf-8') as f:
                        pdata = json.load(f)
                    cc = next((p for p in pdata if p.get('slug') == 'core-committee'), None)
                    if cc and 'video' in cc:
                        cc['video']['url'] = f'/media/core-committee-roster-{ts}.mp4'
                        cc['video']['filename'] = f'core-committee-roster-{ts}.mp4'
                        cc['video']['filesize'] = os.path.getsize(out_public)
                    with open(fpath, 'w', encoding='utf-8') as f:
                        json.dump(pdata, f, indent=2)
    except Exception as e:
        print("Error in faststart/metadata update:", e)

if __name__ == "__main__":
    generate_video()
