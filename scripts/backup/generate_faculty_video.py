import os
import urllib.request
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
import imageio

def generate_faculty_video():
    width, height = 1920, 1080
    fps = 30
    seconds_per_slide = 3
    transition_seconds = 1
    
    frames_per_slide = fps * seconds_per_slide
    frames_transition = fps * transition_seconds

    os.makedirs("public/media", exist_ok=True)
    os.makedirs("dist/media", exist_ok=True)
    cache_dir = "scripts/.photo_cache_faculty"
    os.makedirs(cache_dir, exist_ok=True)

    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 56)
        font_name = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 46)
        font_div = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
        font_dept = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 26)
        font_bio = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 32)
        font_init = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 100)
    except Exception:
        font_title = font_name = font_div = font_dept = font_bio = font_init = ImageFont.load_default()

    json_path = "public/assets/data/faculty_leadership_team.json"
    if not os.path.exists(json_path):
        json_path = "dist/assets/data/faculty_leadership_team.json"
    
    if os.path.exists(json_path):
        import json
        with open(json_path, 'r', encoding='utf-8') as f:
            members = json.load(f)
    else:
        members = [
            {"role": "PATRON & PRINCIPAL", "name": "Dr. S. K. Ramesh", "dept": "Ph.D. in Computer Science · 25+ Yrs Exp.", "div": "INSTITUTE LEADERSHIP", "bio": "Inspiring academic excellence, fostering a culture of research innovation, and supporting advanced student technical chapters.", "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80", "color": [255, 170, 0]}
        ]

    colors_palette = [
        (255, 170, 0), (0, 240, 255), (0, 255, 136), (255, 68, 119),
        (183, 108, 253), (56, 182, 255), (0, 255, 204), (255, 102, 204)
    ]
    for idx, member in enumerate(members):
        if "color" not in member or not member["color"]:
            member["color"] = colors_palette[idx % len(colors_palette)]
        elif isinstance(member["color"], list):
            member["color"] = tuple(member["color"])
        if "init" not in member or not member["init"]:
            parts = member.get("name", "").replace("Dr.", "").replace("Prof.", "").strip().split()
            if len(parts) >= 2:
                member["init"] = (parts[0][0] + parts[1][0]).upper()
            elif len(parts) == 1 and len(parts[0]) >= 2:
                member["init"] = parts[0][:2].upper()
            else:
                member["init"] = "FL"

    print(f"Generating {len(members)} individual Faculty Leadership profile slides...")
    slides_np = []
    
    for i, m in enumerate(members):
        base = Image.new('RGB', (width, height), (12, 10, 18))
        draw = ImageDraw.Draw(base)

        # Background grid and styling
        for x in range(0, width, 100):
            draw.line([(x, 0), (x, height)], fill=(20, 18, 30), width=1)
        for y in range(0, height, 100):
            draw.line([(0, y), (width, y)], fill=(20, 18, 30), width=1)

        # Outer glowing cyber frame
        draw.rectangle([(30, 30), (width - 30, height - 30)], outline=m["color"], width=3)
        
        # Header bar
        draw.rectangle([(30, 30), (width - 30, 110)], fill=(22, 18, 34))
        draw.text((70, 50), "DSSA EXECUTIVE FACULTY LEADERSHIP & MENTORS", fill=(255, 255, 255), font=font_div)
        draw.text((width - 340, 50), f"HONORED MENTOR : {i+1:02d} OF {len(members):02d}", fill=m["color"], font=font_div)
        draw.line([(30, 110), (width - 30, 110)], fill=m["color"], width=2)

        # Left Photo Box
        px, py, pw, ph = 80, 170, 580, 800
        draw.rectangle([(px, py), (px + pw, py + ph)], fill=(18, 16, 28), outline=m["color"], width=3)
        
        # Load photo from cache or url or local path
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
                for candidate in [photo_path, os.path.join("public", photo_path), os.path.join("dist", photo_path), os.path.join("public/assets/team", os.path.basename(photo_path))]:
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
            draw.rectangle([(px + 10, py + 10), (px + pw - 10, py + ph - 70)], fill=(28, 24, 40))
            draw.text((px + pw//2 - 60, py + ph//2 - 80), m["init"], fill=m["color"], font=font_init)

        # Photo footer status
        draw.rectangle([(px + 10, py + ph - 50), (px + pw - 10, py + ph - 10)], fill=(12, 10, 18))
        draw.text((px + 25, py + ph - 42), f"★ DISTINGUISHED FACULTY ADVISOR", fill=m["color"], font=font_div)

        # Right Mentorship Details Box
        rx, ry = 720, 200
        # Division
        draw.rectangle([(rx, ry), (rx + 340, ry + 40)], fill=(26, 22, 42), outline=m["color"], width=1)
        draw.text((rx + 15, ry + 8), m["div"], fill=m["color"], font=font_div)
        
        # Role Title
        draw.text((rx, ry + 70), m["role"], fill=(255, 255, 255), font=font_title)
        
        # Member Name
        draw.text((rx, ry + 150), m["name"], fill=m["color"], font=font_name)
        
        # Department / Qualifications
        draw.text((rx, ry + 220), m["dept"], fill=(200, 210, 225), font=font_dept)
        
        # Cyber divider
        draw.line([(rx, ry + 275), (rx + 650, ry + 275)], fill=m["color"], width=3)

        # Bio text wrapping
        bio_words = m["bio"].split()
        lines = []
        cur_line = []
        for w in bio_words:
            cur_line.append(w)
            if len(" ".join(cur_line)) > 42:
                lines.append(" ".join(cur_line))
                cur_line = []
        if cur_line:
            lines.append(" ".join(cur_line))

        by = ry + 320
        for l in lines:
            draw.text((rx, by), l, fill=(240, 245, 255), font=font_bio)
            by += 50

        # Progress strip at bottom right
        strip_x = rx
        strip_y = 900
        strip_w = 1000
        seg_w = strip_w // len(members)
        for s in range(len(members)):
            sx = strip_x + s * seg_w
            fill_c = m["color"] if s == i else (35, 30, 50)
            draw.rectangle([(sx + 2, strip_y), (sx + seg_w - 4, strip_y + 16)], fill=fill_c)
        draw.text((strip_x, strip_y - 30), "FACULTY GUIDANCE & MENTORSHIP MATRIX:", fill=(180, 190, 210), font=font_div)
        
        slides_np.append(np.array(base))
        if i == 0:
            base.save("public/media/faculty-leadership-v3.jpg", "JPEG", quality=95)
            base.save("dist/media/faculty-leadership-v3.jpg", "JPEG", quality=95)

    import time
    ts = int(time.time())
    out_tmp = f"public/media/tmp_faculty_{ts}.mp4"
    out_public = f"public/media/faculty-leadership-{ts}.mp4"
    out_dist = f"dist/media/faculty-leadership-{ts}.mp4"
    
    print("Writing H.264 frames to MP4 video using imageio-ffmpeg...")
    try:
        writer = imageio.get_writer(out_tmp, fps=fps, codec='libx264', quality=8, pixelformat='yuv420p')
        for slide_idx in range(len(members)):
            curr_slide = slides_np[slide_idx]
            next_slide = slides_np[(slide_idx + 1) % len(members)]
            for _ in range(frames_per_slide - frames_transition):
                writer.append_data(curr_slide)
            for f in range(frames_transition):
                alpha = (f + 1) / frames_transition
                blended = (curr_slide * (1.0 - alpha) + next_slide * alpha).astype(np.uint8)
                writer.append_data(blended)
        writer.close()
        print("Raw MP4 written. Moving to public and dist...")
        if os.path.exists(out_tmp):
            try:
                import imageio_ffmpeg
                ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
                ret = os.system(f'"{ffmpeg_exe}" -y -i "{out_tmp}" -c copy -movflags +faststart "{out_public}" >nul 2>&1')
                if ret != 0:
                    import shutil
                    shutil.copy2(out_tmp, out_public)
            except Exception:
                import shutil
                shutil.copy2(out_tmp, out_public)
            if os.path.exists(out_tmp):
                try: os.remove(out_tmp)
                except: pass
        import shutil
        if os.path.exists(out_public):
            shutil.copy2(out_public, out_dist)

        # Cleanup old videos to keep only the latest one
        prefix = "-".join(os.path.basename(out_public).split("-")[:-1])
        import glob
        for old_vid in glob.glob(f"public/media/{prefix}-*.mp4"):
            if old_vid != out_public:
                try: os.remove(old_vid)
                except: pass
        for old_vid in glob.glob(f"dist/media/{prefix}-*.mp4"):
            if old_vid != out_dist:
                try: os.remove(old_vid)
                except: pass
            print("Video generated successfully:", out_public)
            import json
            for fpath in ["public/assets/data/cms_projects.json", "dist/assets/data/cms_projects.json"]:
                if os.path.exists(fpath):
                    with open(fpath, 'r', encoding='utf-8') as f:
                        pdata = json.load(f)
                    fl = next((p for p in pdata if p.get('slug') == 'faculty-leadership'), None)
                    if fl and 'video' in fl:
                        fl['video']['url'] = f'/media/faculty-leadership-{ts}.mp4?v={ts}'
                        fl['video']['thumbnail'] = '/media/faculty-leadership-v3.jpg?v=3'
                        fl['video']['filename'] = f'faculty-leadership-{ts}.mp4'
                        fl['video']['filesize'] = os.path.getsize(out_public)
                    with open(fpath, 'w', encoding='utf-8') as f:
                        json.dump(pdata, f, indent=2)
    except Exception as e:
        print("Error in faststart/metadata update:", e)

if __name__ == "__main__":
    generate_faculty_video()
