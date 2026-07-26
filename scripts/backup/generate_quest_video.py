import os
import urllib.request
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
import imageio

def generate_quest_video():
    width, height = 1920, 1080
    fps = 30
    seconds_per_slide = 4
    transition_seconds = 1
    
    frames_per_slide = fps * seconds_per_slide
    frames_transition = fps * transition_seconds

    os.makedirs("public/media", exist_ok=True)
    os.makedirs("dist/media", exist_ok=True)
    cache_dir = "scripts/.photo_cache_quest"
    os.makedirs(cache_dir, exist_ok=True)

    try:
        font_main = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 100)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 45)
        font_div = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 26)
    except Exception:
        font_main = font_sub = font_div = ImageFont.load_default()

    json_path = "public/assets/data/quest_events.json"
    if not os.path.exists(json_path):
        json_path = "dist/assets/data/quest_events.json"
    
    if os.path.exists(json_path):
        import json
        with open(json_path, 'r', encoding='utf-8') as f:
            quest_data = json.load(f)
    else:
        quest_data = [
            {"title": "CODING COMPETITIONS", "desc": "Pushing limits in 24-hour hackathons and algorithmic challenges.", "photo": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&auto=format&fit=crop&q=80", "color": [255, 30, 86]},
            {"title": "TECHNICAL WORKSHOPS", "desc": "Hands-on experience with emerging technologies.", "photo": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&auto=format&fit=crop&q=80", "color": [0, 255, 170]},
            {"title": "INNOVATION CHALLENGES", "desc": "Building real-world solutions for tomorrow's problems.", "photo": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&auto=format&fit=crop&q=80", "color": [0, 150, 255]}
        ]

    colors_palette = [(255, 30, 86), (0, 255, 170), (0, 150, 255), (255, 200, 0)]
    for idx, item in enumerate(quest_data):
        if "color" not in item or not item["color"]:
            item["color"] = colors_palette[idx % len(colors_palette)]
        elif isinstance(item["color"], list):
            item["color"] = tuple(item["color"])

    print(f"Generating {len(quest_data)} Innovator Quest slides...")
    slides_np = []
    
    for i, item in enumerate(quest_data):
        base = Image.new('RGB', (width, height), (15, 10, 18))
        draw = ImageDraw.Draw(base)

        photo_img = None
        photo_path = item.get("photo") or item.get("url", "")
        try:
            if photo_path.startswith("http://") or photo_path.startswith("https://"):
                cache_file = os.path.join(cache_dir, f"quest_{i}.jpg")
                if not os.path.exists(cache_file):
                    req = urllib.request.Request(photo_path, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=4) as resp, open(cache_file, 'wb') as out:
                        out.write(resp.read())
                if os.path.exists(cache_file):
                    photo_img = Image.open(cache_file).convert('RGB')
            else:
                target = None
                for candidate in [photo_path, os.path.join("public", photo_path), os.path.join("dist", photo_path)]:
                    if os.path.exists(candidate):
                        target = candidate
                        break
                if target:
                    photo_img = Image.open(target).convert('RGB')
        except Exception:
            pass

        if photo_img:
            # Zoomed in crop for high energy
            photo_img = ImageOps.fit(photo_img, (width, height), Image.Resampling.LANCZOS)
            
            # Simple dark overlay for text readability (no heavy color tint)
            overlay = Image.new('RGBA', (width, height), (0, 0, 0, 100))
            
            base.paste(photo_img, (0, 0))
            base.paste(overlay, (0, 0), overlay)
        else:
            for x in range(0, width, 60):
                draw.line([(x, 0), (x, height)], fill=(25, 20, 30), width=1)
            for y in range(0, height, 60):
                draw.line([(0, y), (width, y)], fill=(25, 20, 30), width=1)



        # Content Box
        bx = 120
        by = height - 300
        
        # Title
        title_text = item.get("title", "EVENT")
        draw.text((bx, by), title_text, fill=(255, 255, 255), font=font_main)
        
        # Subtitle
        sub_text = item.get("desc", "Experience the thrill of technology.")
        import textwrap
        wrapped_sub = textwrap.wrap(sub_text, width=65)
        for line_i, line in enumerate(wrapped_sub):
            draw.text((bx + 5, by + 120 + line_i * 50), line, fill=(200, 210, 220), font=font_sub)

        # Header Indicator
        draw.text((120, 90), "INNOVATOR QUEST", fill=(255, 255, 255), font=font_div)
        draw.text((width - 300, 90), f"PHASE // {i+1:02d}", fill=item["color"], font=font_div)

        slides_np.append(np.array(base))
        if i == 0:
            base.save("public/media/quest-slideshow-thumbnail.jpg", "JPEG", quality=95)
            base.save("dist/media/quest-slideshow-thumbnail.jpg", "JPEG", quality=95)

    import time
    ts = int(time.time())
    out_tmp = f"public/media/tmp_quest_{ts}.mp4"
    out_public = f"public/media/quest-slideshow-{ts}.mp4"
    out_dist = f"dist/media/quest-slideshow-{ts}.mp4"
    
    print("Writing H.264 frames to MP4 video using imageio-ffmpeg...")
    try:
        writer = imageio.get_writer(out_tmp, fps=fps, codec='libx264', quality=8, pixelformat='yuv420p', macro_block_size=None)
        for slide_idx in range(len(quest_data)):
            curr_slide = slides_np[slide_idx]
            next_slide = slides_np[(slide_idx + 1) % len(quest_data)]
            for _ in range(frames_per_slide - frames_transition):
                writer.append_data(curr_slide)
            for f in range(frames_transition):
                alpha = (f + 1) / frames_transition
                blended = (curr_slide.astype(np.float32) * (1.0 - alpha) + next_slide.astype(np.float32) * alpha).astype(np.uint8)
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
            print("Video generated successfully:", out_public)
            
            import json
            for fpath in ['public/assets/data/cms_projects.json', 'dist/assets/data/cms_projects.json']:
                if os.path.exists(fpath):
                    with open(fpath, 'r', encoding='utf-8') as f:
                        pdata = json.load(f)
                    fl = next((p for p in pdata if p.get('slug') == 'innovator-quest'), None)
                    if fl and 'video' in fl:
                        fl['video']['url'] = f'/media/quest-slideshow-{ts}.mp4?v={ts}'
                        fl['video']['thumbnail'] = f'/media/quest-slideshow-thumbnail.jpg?v={ts}'
                        fl['image'] = f'/media/quest-slideshow-thumbnail.jpg?v={ts}'
                        fl['video']['filename'] = f'quest-slideshow-{ts}.mp4'
                        fl['video']['filesize'] = os.path.getsize(out_public)
                    with open(fpath, 'w', encoding='utf-8') as f:
                        json.dump(pdata, f, indent=2)
    except Exception as e:
        print("Error in faststart/metadata update:", e)

if __name__ == "__main__":
    generate_quest_video()
