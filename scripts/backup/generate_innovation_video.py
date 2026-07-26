import os
import urllib.request
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
import imageio
import time
import json

def generate_innovation_video():
    slug = "innovation-in-action"
    title_upper = "INNOVATION IN ACTION"
    cache_dir_name = "innovation"
    
    default_data = [
        {"title": "CODING", "desc": "Building the future through code.", "photo": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1920&auto=format&fit=crop&q=80", "color": [0, 240, 255]},
        {"title": "WORKSHOPS", "desc": "Hands-on experience and rapid prototyping.", "photo": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1920&auto=format&fit=crop&q=80", "color": [255, 68, 119]}
    ]

    width, height = 1920, 1080
    fps = 30
    seconds_per_slide = 5
    transition_seconds = 2
    
    frames_per_slide = fps * seconds_per_slide
    frames_transition = fps * transition_seconds

    os.makedirs("public/media", exist_ok=True)
    os.makedirs("dist/media", exist_ok=True)
    cache_dir = f"scripts/.photo_cache_{cache_dir_name}"
    os.makedirs(cache_dir, exist_ok=True)

    try:
        font_cinematic_huge = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 100)
        font_cinematic_sub = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 55)
        font_quote = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 45)
        font_div = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
    except Exception:
        font_cinematic_huge = font_cinematic_sub = font_quote = font_div = ImageFont.load_default()

    json_path = f"public/assets/data/{slug}_data.json"
    if not os.path.exists(json_path):
        json_path = f"dist/assets/data/{slug}_data.json"
    
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            slides_data = json.load(f)
    else:
        slides_data = default_data

    colors_palette = [(186, 124, 222), (0, 240, 255), (255, 68, 119), (255, 170, 0), (0, 255, 136)]
    for idx, item in enumerate(slides_data):
        if "color" not in item or not item["color"]:
            item["color"] = colors_palette[idx % len(colors_palette)]
        elif isinstance(item["color"], list):
            item["color"] = tuple(item["color"])

    print(f"Generating {len(slides_data)} slides for {slug}...")
    slides_np = []
    
    for i, item in enumerate(slides_data):
        base = Image.new('RGB', (width, height), (5, 5, 8))
        draw = ImageDraw.Draw(base)

        photo_img = None
        photo_path = item.get("photo") or item.get("url", "")
        try:
            if photo_path.startswith("http://") or photo_path.startswith("https://"):
                cache_file = os.path.join(cache_dir, f"{slug}_{i}.jpg")
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
            photo_img = ImageOps.fit(photo_img, (width, height), Image.Resampling.LANCZOS)
            overlay = Image.new('RGBA', (width, height), (0, 0, 0, 100))
            base.paste(photo_img, (0, 0))
            base.paste(overlay, (0, 0), overlay)
        else:
            for x in range(0, width, 60):
                draw.line([(x, 0), (x, height)], fill=(25, 20, 30), width=1)
            for y in range(0, height, 60):
                draw.line([(0, y), (width, y)], fill=(25, 20, 30), width=1)

        title_text = item.get("title", title_upper)
        quote_text = item.get("desc", item.get("quote", "Innovation meets leadership."))
        
        import textwrap
        wrapped_sub = textwrap.wrap(quote_text, width=65)

        bx = 120
        by = height - 300 - (len(wrapped_sub) - 1) * 50
        
        draw.text((bx, by), title_text, fill=(255, 255, 255), font=font_cinematic_huge)

        for line_i, line in enumerate(wrapped_sub):
            draw.text((bx + 5, by + 120 + line_i * 50), line, fill=(200, 210, 220), font=font_quote)

        c = tuple(item.get("color", [0, 255, 170]))
        draw.text((120, 90), title_upper, fill=(255, 255, 255), font=font_div)
        draw.text((width - 300, 90), f"ACT {i+1:02d} // 2026", fill=c, font=font_div)

        slides_np.append(np.array(base))
        if i == 0:
            base.save(f"public/media/{slug}-slideshow-thumbnail.jpg", "JPEG", quality=95)
            base.save(f"dist/media/{slug}-slideshow-thumbnail.jpg", "JPEG", quality=95)

    ts = int(time.time())
    out_tmp = f"public/media/tmp_{slug}_{ts}.mp4"
    out_public = f"public/media/{slug}-slideshow-{ts}.mp4"
    out_dist = f"dist/media/{slug}-slideshow-{ts}.mp4"
    
    print(f"Writing MP4 for {slug}...")
    try:
        writer = imageio.get_writer(out_tmp, fps=fps, codec='libx264', quality=8, pixelformat='yuv420p', macro_block_size=None)
        for slide_idx in range(len(slides_data)):
            curr_slide = slides_np[slide_idx]
            next_slide = slides_np[(slide_idx + 1) % len(slides_data)]
            for _ in range(frames_per_slide - frames_transition):
                writer.append_data(curr_slide)
            for f in range(frames_transition):
                alpha = (f + 1) / frames_transition
                blended = (curr_slide.astype(np.float32) * (1.0 - alpha) + next_slide.astype(np.float32) * alpha).astype(np.uint8)
                writer.append_data(blended)
        writer.close()
        
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
            print(f"Video {slug} generated successfully!")
            
            for fpath in ['public/assets/data/cms_projects.json', 'dist/assets/data/cms_projects.json']:
                if os.path.exists(fpath):
                    with open(fpath, 'r', encoding='utf-8') as f:
                        pdata = json.load(f)
                    fl = next((p for p in pdata if p.get('slug') == slug), None)
                    if fl and 'video' in fl:
                        fl['video']['url'] = f'/media/{slug}-slideshow-{ts}.mp4?v={ts}'
                        fl['video']['thumbnail'] = f'/media/{slug}-slideshow-thumbnail.jpg?v={ts}'
                        fl['image'] = f'/media/{slug}-slideshow-thumbnail.jpg?v={ts}'
                        fl['video']['filename'] = f'{slug}-slideshow-{ts}.mp4'
                        fl['video']['filesize'] = os.path.getsize(out_public)
                    with open(fpath, 'w', encoding='utf-8') as f:
                        json.dump(pdata, f, indent=2)
    except Exception as e:
        print(f"Error for {slug}:", e)

if __name__ == "__main__":
    generate_innovation_video()
