import os
import numpy as np
import urllib.request
import imageio
from PIL import Image, ImageDraw, ImageFont, ImageOps

def generate_backbone_videos():
    width, height = 1920, 1080
    fps = 20
    seconds_per_slide = 3.0
    transition_seconds = 0.5
    frames_per_slide = int(seconds_per_slide * fps)
    frames_transition = int(transition_seconds * fps)

    os.makedirs("public/media", exist_ok=True)
    os.makedirs("dist/media", exist_ok=True)
    cache_dir = "scripts/.photo_cache_backbone"
    os.makedirs(cache_dir, exist_ok=True)

    try:
        font_diff_title = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 54)
        font_diff_name = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 48)
        font_diff_term = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 24)
        font_diff_bio = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 32)
        font_diff_num = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 22)
        font_init = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 100)
        font_dept = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 26)
    except Exception:
        font_diff_title = font_diff_name = font_diff_term = font_diff_bio = font_diff_num = font_init = font_dept = ImageFont.load_default()

    json_path = "public/assets/data/our_backbone_team.json"
    if not os.path.exists(json_path):
        json_path = "dist/assets/data/our_backbone_team.json"
    
    if os.path.exists(json_path):
        import json
        with open(json_path, 'r', encoding='utf-8') as f:
            coordinators = json.load(f)[:4]
    else:
        coordinators = [
            {"role": "SENIOR TECH COORDINATOR", "name": "Karthik Nambiar", "dept": "B.Tech Data Science · 3rd Yr", "div": "INFRASTRUCTURE & DEV", "bio": "Coordinating backend infrastructure, server maintenance, and technical workshops for student developers across campus.", "color": (0, 240, 255), "url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80", "init": "KN"},
            {"role": "AI WORKSHOP COORDINATOR", "name": "Shreya Mukherjee", "dept": "B.Tech AI & ML · 3rd Yr", "div": "LEARNING & RESEARCH", "bio": "Organizing hands-on machine learning bootcamps, AI study circles, and peer mentoring sessions for aspiring data scientists.", "color": (0, 255, 136), "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80", "init": "SM"},
            {"role": "SYMPOSIUM OPERATIONS LEAD", "name": "Manish Choudhary", "dept": "B.Tech Comp Sci · 3rd Yr", "div": "OPERATIONS & EVENTS", "bio": "Managing on-ground logistics, stage coordination, and schedule execution during annual DSSA tech symposiums.", "color": (255, 170, 0), "url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80", "init": "MC"},
            {"role": "OUTREACH & CORPORATE RELATIONS", "name": "Pooja Bhattacharya", "dept": "B.Tech Data Science · 2nd Yr", "div": "CORPORATE RELATIONS", "bio": "Liaising with industry experts, managing guest speaker schedules, and handling corporate sponsorship communications.", "color": (255, 68, 119), "url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80", "init": "PB"},
            {"role": "UI/UX & CREATIVE LEAD", "name": "Tushar Goswami", "dept": "B.Des / AI · 3rd Yr", "div": "CREATIVE & BRANDING", "bio": "Designing digital banners, website UI components, and futuristic promotional media for association events and fests.", "color": (183, 108, 253), "url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80", "init": "TG"},
            {"role": "COMMUNITY ENGAGEMENT LEAD", "name": "Nandini Rao", "dept": "B.Tech AI & ML · 2nd Yr", "div": "COMMUNITY & MEMBERSHIP", "bio": "Fostering student participation, onboarding first-year members, and organizing interactive community hack-nights.", "color": (56, 182, 255), "url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80", "init": "NR"},
            {"role": "HACKATHON LOGISTICS LEAD", "name": "Rishabh Singhal", "dept": "B.Tech Data Science · 3rd Yr", "div": "COMPETITION LOGISTICS", "bio": "Coordinating 24-hour hackathon logistics, high-speed network setups, participant registration, and mentor allocations.", "color": (0, 255, 204), "url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80", "init": "RS"},
            {"role": "RESEARCH & PUBLICATION LEAD", "name": "Aarushi Desai", "dept": "B.Tech AI & ML · 3rd Yr", "div": "RESEARCH DIVISION", "bio": "Assisting student research groups, editing technical whitepapers, and managing DSSA journal publications.", "color": (255, 102, 204), "url": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&auto=format&fit=crop&q=80", "init": "AD"},
            {"role": "DIGITAL MEDIA BROADCASTING", "name": "Varun Kapoor", "dept": "B.Tech Comp Sci · 2nd Yr", "div": "MEDIA PRODUCTION", "bio": "Managing live streams of tech talks, video editing for DSSA YouTube channel, and social media broadcasting.", "color": (255, 136, 68), "url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80", "init": "VK"},
            {"role": "WEB DEVELOPMENT LEAD", "name": "Sneha Joshi", "dept": "B.Tech Data Science · 2nd Yr", "div": "WEB & SYSTEMS", "bio": "Maintaining DSSA web portals, updating event schedules, and managing frontend deployments and interactive demos.", "color": (162, 136, 255), "url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80", "init": "SJ"},
            {"role": "FINANCE & AUDITING LEAD", "name": "Aditya Pratap Singh", "dept": "B.Tech AI & ML · 3rd Yr", "div": "FINANCE & AUDIT", "bio": "Tracking event expenditures, managing departmental budgets, and coordinating with financial auditors.", "color": (0, 212, 255), "url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80", "init": "AS"},
            {"role": "CAMPUS AMBASSADOR LEAD", "name": "Meera Krishnan", "dept": "B.Tech Data Science · 2nd Yr", "div": "OUTREACH & AMBASSADORS", "bio": "Leading inter-college student networking, representing DSSA at national tech meets, and growing campus reach.", "color": (119, 170, 255), "url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80", "init": "MK"}
        ]

    colors_palette = [
        (0, 240, 255), (0, 255, 136), (255, 170, 0), (255, 68, 119),
        (183, 108, 253), (56, 182, 255), (0, 255, 204), (255, 102, 204),
        (255, 136, 68), (162, 136, 255), (0, 212, 255), (119, 170, 255)
    ]
    for idx, coord in enumerate(coordinators):
        if "color" not in coord or not coord["color"]:
            coord["color"] = colors_palette[idx % len(colors_palette)]
        elif isinstance(coord["color"], list):
            coord["color"] = tuple(coord["color"])
        if "init" not in coord or not coord["init"]:
            parts = coord.get("name", "").strip().split()
            if len(parts) >= 2:
                coord["init"] = (parts[0][0] + parts[1][0]).upper()
            elif len(parts) == 1 and len(parts[0]) >= 2:
                coord["init"] = parts[0][:2].upper()
            else:
                coord["init"] = "DS"

    photo_cache = []
    print(f"Pre-fetching {len(coordinators)} coordinator photos...")
    for i, m in enumerate(coordinators):
        photo_path = m.get("photo") or m.get("url", "")
        try:
            if photo_path.startswith("http://") or photo_path.startswith("https://"):
                cache_file = os.path.join(cache_dir, f"coord_{i}.jpg")
                if not os.path.exists(cache_file):
                    req = urllib.request.Request(photo_path, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=4) as resp, open(cache_file, 'wb') as out:
                        out.write(resp.read())
                if os.path.exists(cache_file):
                    photo_cache.append(Image.open(cache_file).convert('RGB'))
                else:
                    photo_cache.append(None)
            else:
                target = None
                for candidate in [photo_path, os.path.join("public", photo_path), os.path.join("dist", photo_path), os.path.join("public/assets/team", os.path.basename(photo_path))]:
                    if os.path.exists(candidate):
                        target = candidate
                        break
                if target and os.path.exists(target):
                    photo_cache.append(Image.open(target).convert('RGB'))
                else:
                    photo_cache.append(None)
        except Exception as e:
            print(f"Failed to load photo for {m.get('name')}: {e}")
            photo_cache.append(None)

    print("Generating Futuristic Telemetry Console Design (Version 2)...")
    slides_v2 = []
    for i, m in enumerate(coordinators):
        base = Image.new('RGB', (width, height), (5, 10, 12))
        draw = ImageDraw.Draw(base)

        for x in range(0, width, 50):
            for y in range(0, height, 50):
                draw.point((x, y), fill=(15, 35, 30))
        for y in range(120, height - 100, 40):
            draw.line([(40, y), (width - 40, y)], fill=(10, 22, 20), width=1)

        draw.rectangle([(25, 25), (width - 25, height - 25)], outline=(0, 255, 128), width=2)
        draw.line([(20, 20), (70, 20)], fill=(255, 200, 0), width=5)
        draw.line([(20, 20), (20, 70)], fill=(255, 200, 0), width=5)
        draw.line([(width - 70, 20), (width - 20, 20)], fill=(255, 200, 0), width=5)
        draw.line([(width - 20, 20), (width - 20, 70)], fill=(255, 200, 0), width=5)
        draw.line([(20, height - 20), (70, height - 20)], fill=(255, 200, 0), width=5)
        draw.line([(20, height - 20), (20, height - 70)], fill=(255, 200, 0), width=5)
        draw.line([(width - 70, height - 20), (width - 20, height - 20)], fill=(255, 200, 0), width=5)
        draw.line([(width - 20, height - 20), (width - 20, height - 70)], fill=(255, 200, 0), width=5)

        draw.rectangle([(25, 25), (width - 25, 100)], fill=(8, 18, 16))
        draw.text((60, 42), "// DSSA OPERATIONAL BACKBONE // TELEMETRY NETWORK ACTIVE", fill=(0, 255, 128), font=font_diff_term)
        draw.text((width - 420, 42), f"[ NODE : {i+1:02d} / {len(coordinators):02d} ONLINE ]", fill=(255, 200, 0), font=font_diff_term)
        draw.line([(25, 100), (width - 25, 100)], fill=(0, 255, 128), width=2)

        px, py, pw, ph = 1120, 160, 660, 750
        draw.rectangle([(px - 4, py - 4), (px + pw + 4, py + ph + 4)], fill=(0, 0, 0), outline=(0, 255, 128), width=3)
        draw.rectangle([(px, py), (px + pw, py + 50)], fill=(12, 30, 24))
        draw.text((px + 20, py + 12), f"IDENTITY VERIFIED : COORDINATOR #{i+1:02d}", fill=(255, 200, 0), font=font_diff_term)
        draw.line([(px, py + 50), (px + pw, py + 50)], fill=(0, 255, 128), width=2)
        
        p_img = photo_cache[i]
        if p_img:
            fitted = ImageOps.fit(p_img, (pw - 20, ph - 120), Image.Resampling.LANCZOS)
            
            if m.get("name", "").lower() == "coming soon":
                # Darken image and add mystery question mark
                dark_overlay = Image.new('RGB', fitted.size, (0, 20, 10))
                fitted = Image.blend(fitted, dark_overlay, alpha=0.85)
                draw_fitted = ImageDraw.Draw(fitted)
                draw_fitted.text((fitted.width//2 - 30, fitted.height//2 - 50), "?", fill=(0, 255, 128), font=font_init)

            base.paste(fitted, (px + 10, py + 60))
        else:
            draw.rectangle([(px + 10, py + 60), (px + pw - 10, py + ph - 60)], fill=(10, 25, 20))
            draw.text((px + pw//2 - 30, py + ph//2 - 50), "?", fill=(0, 255, 128), font=font_init)

        for sy in range(py + 60, py + ph - 60, 8):
            draw.line([(px + 10, sy), (px + pw - 10, sy)], fill=(0, 255, 128, 40), width=1)

        draw.rectangle([(px + 10, py + ph - 50), (px + pw - 10, py + ph - 10)], fill=(5, 15, 12))
        draw.text((px + 25, py + ph - 40), f"STATUS: ACTIVE DEPARTMENT LEAD // DSSA-2027", fill=(0, 255, 128), font=font_diff_term)

        lx, ly = 80, 180
        draw.rectangle([(lx, ly), (lx + 380, ly + 44)], fill=(255, 200, 0))
        draw.text((lx + 20, ly + 8), f"[ {m['div']} ]", fill=(0, 0, 0), font=font_diff_term)
        
        draw.text((lx, ly + 80), m["role"], fill=(255, 255, 255), font=font_diff_title)
        draw.text((lx, ly + 160), f"> {m['name'].upper()}", fill=(0, 255, 128), font=font_diff_name)
        draw.text((lx, ly + 230), m["dept"], fill=(200, 220, 210), font=font_dept)
        draw.text((lx, ly + 285), "+-------------------------------------------------------------------+", fill=(255, 200, 0), font=font_diff_term)

        draw.text((lx, ly + 340), "MISSION_SCOPE:", fill=(255, 200, 0), font=font_diff_term)
        bio_words = m["bio"].split()
        lines, cur = [], []
        for w in bio_words:
            cur.append(w)
            if len(" ".join(cur)) > 42:
                lines.append(" ".join(cur))
                cur = []
        if cur:
            lines.append(" ".join(cur))

        by = ly + 385
        for l in lines:
            draw.text((lx + 20, by), f">> {l}", fill=(240, 255, 248), font=font_diff_bio)
            by += 50

        bx, by_bar = 80, 950
        draw.text((bx, by_bar - 35), "// TELEMETRY NODE MATRIX : CHOOSE ACTIVE STREAM", fill=(255, 200, 0), font=font_diff_term)
        node_w = 140
        for s in range(len(coordinators)):
            nx = bx + s * node_w
            if s == i:
                draw.rectangle([(nx, by_bar), (nx + 120, by_bar + 45)], fill=(0, 255, 128), outline=(255, 200, 0), width=2)
                draw.text((nx + 28, by_bar + 10), f"[{s+1:02d}]", fill=(0, 0, 0), font=font_diff_num)
            else:
                draw.rectangle([(nx, by_bar), (nx + 120, by_bar + 45)], fill=(12, 28, 24), outline=(20, 50, 40), width=1)
                draw.text((nx + 28, by_bar + 10), f" {s+1:02d} ", fill=(100, 150, 130), font=font_diff_num)

        slides_v2.append(np.array(base))

    Image.fromarray(slides_v2[0]).save("public/media/our-backbone-v2.jpg")
    if os.path.exists("dist/media"):
        Image.fromarray(slides_v2[0]).save("dist/media/our-backbone-v2.jpg")

    import time
    ts = int(time.time())
    out_tmp = f"public/media/tmp_backbone_{ts}.mp4"
    out_pub = f"public/media/our-backbone-{ts}.mp4"
    out_dst = f"dist/media/our-backbone-{ts}.mp4"
    print(f"Writing H.264 video: {out_tmp}...")
    writer = imageio.get_writer(out_tmp, fps=fps, codec='libx264', quality=8, macro_block_size=8)
    for i in range(len(slides_v2)):
        curr = slides_v2[i].astype(np.float32)
        nxt = slides_v2[(i + 1) % len(slides_v2)].astype(np.float32)
        curr_uint8 = slides_v2[i]
        for _ in range(frames_per_slide):
            writer.append_data(curr_uint8)
        for f in range(1, frames_transition + 1):
            alpha = f / float(frames_transition)
            blended = (curr * (1.0 - alpha) + nxt * alpha).astype(np.uint8)
            writer.append_data(blended)
    writer.close()

    try:
        import subprocess
        import imageio_ffmpeg
        exe = imageio_ffmpeg.get_ffmpeg_exe()
        cmd = [exe, '-y', '-i', out_tmp, '-c', 'copy', '-movflags', '+faststart', out_pub]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(out_pub) and os.path.getsize(out_pub) > 0:
            if os.path.exists("dist/media"):
                import shutil
                shutil.copy2(out_pub, out_dst)
            if os.path.exists(out_tmp):
                os.remove(out_tmp)
            print(f"Successfully generated faststart video {out_pub} ({os.path.getsize(out_pub)} bytes)")

            import json
            for fpath in ['public/assets/data/cms_projects.json', 'dist/assets/data/cms_projects.json']:
                if os.path.exists(fpath):
                    with open(fpath, 'r', encoding='utf-8') as f:
                        pdata = json.load(f)
                    bb = next((p for p in pdata if p.get('slug') == 'our-backbone'), None)
                    if bb and 'video' in bb:
                        bb['video']['url'] = f'/media/our-backbone-{ts}.mp4?v={ts}'
                        bb['video']['filename'] = f'our-backbone-{ts}.mp4'
                        bb['video']['thumbnail'] = '/media/our-backbone-v2.jpg'
                        bb['video']['filesize'] = os.path.getsize(out_pub)
                    with open(fpath, 'w', encoding='utf-8') as f:
                        json.dump(pdata, f, indent=2)
    except Exception as e:
        print("Faststart/metadata update note:", e)

if __name__ == "__main__":
    generate_backbone_videos()
