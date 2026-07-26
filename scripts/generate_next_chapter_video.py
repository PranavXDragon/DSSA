import os
import urllib.request
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
import imageio

def generate_next_chapter_video():
    width, height = 1920, 1080
    fps = 30
    seconds_per_slide = 5
    transition_seconds = 1
    
    frames_per_slide = fps * seconds_per_slide
    frames_transition = fps * transition_seconds

    os.makedirs("public/media", exist_ok=True)
    os.makedirs("dist/media", exist_ok=True)
    cache_dir = "scripts/.photo_cache_next"
    os.makedirs(cache_dir, exist_ok=True)

    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 75)
        font_quote = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 55)
        font_div = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 26)
    except Exception:
        font_title = font_quote = font_div = ImageFont.load_default()

    json_path = "public/assets/data/next_chapter.json"
    if not os.path.exists(json_path):
        json_path = "dist/assets/data/next_chapter.json"
    
    if os.path.exists(json_path):
        import json
        with open(json_path, 'r', encoding='utf-8') as f:
            chapter_data = json.load(f)
    else:
        chapter_data = [
            {"title": "BEYOND LIMITS", "quote": "\"The future belongs to those who learn more skills and combine them in creative ways.\"", "photo": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=80", "color": [254, 179, 67]},
            {"title": "GLOBAL IMPACT", "quote": "\"Innovation distinguishes between a leader and a follower. Our students lead.\"", "photo": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&auto=format&fit=crop&q=80", "color": [0, 240, 255]},
            {"title": "CONTINUOUS LEARNING", "quote": "\"We never stop learning. We never stop growing. The journey continues.\"", "photo": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&auto=format&fit=crop&q=80", "color": [255, 68, 119]}
        ]

    colors_palette = [(254, 179, 67), (0, 240, 255), (255, 68, 119), (0, 255, 136), (183, 108, 253)]
    for idx, item in enumerate(chapter_data):
        if "color" not in item or not item["color"]:
            item["color"] = colors_palette[idx % len(colors_palette)]
        elif isinstance(item["color"], list):
            item["color"] = tuple(item["color"])

    print(f"Generating {len(chapter_data)} Next Chapter slides...")
    slides_np = []
    
    for i, item in enumerate(chapter_data):
        base = Image.new('RGB', (width, height), (10, 10, 15))
        draw = ImageDraw.Draw(base)

        photo_img = None
        photo_path = item.get("photo") or item.get("url", "")
        try:
            if photo_path.startswith("http://") or photo_path.startswith("https://"):
                cache_file = os.path.join(cache_dir, f"next_{i}.jpg")
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
            # Resize exactly to 1920x1080 without cropping to preserve any baked-in AI frames
            photo_img = photo_img.resize((width, height), Image.Resampling.LANCZOS)
            
            # Subtle transparent overlay instead of heavy vintage tint
            overlay = Image.new('RGBA', (width, height), (0, 0, 0, 10))
            base.paste(photo_img, (0, 0))
            base.paste(overlay, (0, 0), overlay)
        else:
            for x in range(0, width, 150):
                draw.line([(x, 0), (x, height)], fill=(20, 20, 30), width=1)
            for y in range(0, height, 150):
                draw.line([(0, y), (width, y)], fill=(20, 20, 30), width=1)

        # Subtle Director/Scene tags
        draw.text((80, 80), "THE NEXT CHAPTER · DSSA", fill=(255, 255, 255), font=font_div)
        draw.text((width - 300, 80), f"SCENE {i+1:02d} OF {len(chapter_data):02d}", fill=item["color"], font=font_div)

        slides_np.append(np.array(base))
        if i == 0:
            base.save("public/media/next-chapter-slideshow-thumbnail.jpg", "JPEG", quality=95)
            base.save("dist/media/next-chapter-slideshow-thumbnail.jpg", "JPEG", quality=95)

    import time
    ts = int(time.time())
    out_tmp = f"public/media/tmp_next_{ts}.mp4"
    out_public = f"public/media/next-chapter-slideshow-{ts}.mp4"
    out_dist = f"dist/media/next-chapter-slideshow-{ts}.mp4"
    
    print("Writing H.264 frames to MP4 video using imageio-ffmpeg...")
    try:
        writer = imageio.get_writer(out_tmp, fps=fps, codec='libx264', quality=8, pixelformat='yuv420p', macro_block_size=None)
        for slide_idx in range(len(chapter_data)):
            curr_slide = slides_np[slide_idx]
            next_slide = slides_np[(slide_idx + 1) % len(chapter_data)]
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
            for fpath in ['public/assets/data/cms_projects.json', 'dist/assets/data/cms_projects.json']:
                if os.path.exists(fpath):
                    with open(fpath, 'r', encoding='utf-8') as f:
                        pdata = json.load(f)
                    fl = next((p for p in pdata if p.get('slug') == 'the-next-chapter'), None)
                    if fl and 'video' in fl:
                        fl['video']['url'] = f'/media/next-chapter-slideshow-{ts}.mp4?v={ts}'
                        fl['video']['thumbnail'] = f'/media/next-chapter-slideshow-thumbnail.jpg?v={ts}'
                        fl['image'] = f'/media/next-chapter-slideshow-thumbnail.jpg?v={ts}'
                        fl['video']['filename'] = f'next-chapter-slideshow-{ts}.mp4'
                        fl['video']['filesize'] = os.path.getsize(out_public)
                    with open(fpath, 'w', encoding='utf-8') as f:
                        json.dump(pdata, f, indent=2)
    except Exception as e:
        print("Error in faststart/metadata update:", e)

if __name__ == "__main__":
    generate_next_chapter_video()
