import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
import imageio

def generate_roadmap_video():
    width, height = 1920, 1080
    fps = 30
    seconds_per_slide = 5
    transition_seconds = 1
    
    frames_per_slide = fps * seconds_per_slide
    frames_transition = fps * transition_seconds

    os.makedirs("public/media", exist_ok=True)
    os.makedirs("dist/media", exist_ok=True)

    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 65)
        font_month = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 100)
        font_desc = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 40)
        font_div = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 24)
    except Exception:
        font_title = font_month = font_desc = font_div = ImageFont.load_default()

    json_path = "public/assets/data/roadmap_events.json"
    if not os.path.exists(json_path):
        json_path = "dist/assets/data/roadmap_events.json"
    
    if os.path.exists(json_path):
        import json
        with open(json_path, 'r', encoding='utf-8') as f:
            roadmap = json.load(f)
    else:
        roadmap = [
            {"month": "AUG", "year": "2025", "title": "Forum Installation", "desc": "The grand inauguration of the new core committee and revealing the academic year plan.", "color": [0, 240, 255]},
            {"month": "SEP", "year": "2025", "title": "Tech Carnival", "desc": "A week-long celebration of technology with workshops, seminars, and coding challenges.", "color": [255, 68, 119]},
            {"month": "OCT", "year": "2025", "title": "Hackathon 1.0", "desc": "Our flagship 24-hour hackathon where students build real-world solutions.", "color": [0, 255, 136]},
            {"month": "NOV", "year": "2025", "title": "Industry Connect", "desc": "Networking sessions and guest lectures from top tech industry leaders.", "color": [255, 170, 0]},
            {"month": "JAN", "year": "2026", "title": "Project Showcase", "desc": "Students present their semester projects and innovative research to the faculty.", "color": [183, 108, 253]}
        ]

    colors_palette = [(0, 240, 255), (255, 68, 119), (0, 255, 136), (255, 170, 0), (183, 108, 253), (56, 182, 255)]
    for idx, item in enumerate(roadmap):
        if "color" not in item or not item["color"]:
            item["color"] = colors_palette[idx % len(colors_palette)]
        elif isinstance(item["color"], list):
            item["color"] = tuple(item["color"])

    print(f"Generating {len(roadmap)} Roadmap slides...")
    slides_np = []
    
    for i, item in enumerate(roadmap):
        base = Image.new('RGB', (width, height), (12, 14, 22))
        draw = ImageDraw.Draw(base)

        # Draw a beautiful grid
        for x in range(0, width, 80):
            draw.line([(x, 0), (x, height)], fill=(20, 24, 38), width=1)
        for y in range(0, height, 80):
            draw.line([(0, y), (width, y)], fill=(20, 24, 38), width=1)

        # The Timeline Path
        line_y = height // 2
        draw.line([(0, line_y), (width, line_y)], fill=(30, 35, 55), width=8)
        
        # Highlighted segment
        seg_w = width // len(roadmap)
        draw.line([(i * seg_w, line_y), ((i + 1) * seg_w, line_y)], fill=item["color"], width=12)

        # The Node
        node_x = (i * seg_w) + (seg_w // 2)
        draw.ellipse([(node_x - 20, line_y - 20), (node_x + 20, line_y + 20)], fill=(255, 255, 255), outline=item["color"], width=6)
        
        box_h = 400

        # Connect node to content box
        if i % 2 == 0:
            # Content above
            box_y = line_y - 440
            draw.line([(node_x, line_y - 20), (node_x, box_y + box_h)], fill=item["color"], width=4)
        else:
            # Content below
            box_y = line_y + 60
            draw.line([(node_x, line_y + 20), (node_x, box_y)], fill=item["color"], width=4)

        # Dynamic Box sizing based on title width
        title_txt = item.get("title", "Event Title")
        title_w = font_title.getlength(title_txt) if hasattr(font_title, 'getlength') else font_title.getbbox(title_txt)[2]
        
        box_w = max(880, int(title_w) + 230 + 60)
        box_w = min(1500, box_w) # cap it to avoid going completely off-screen
        max_width = box_w - 230 - 30

        # Drawing Content Box
        box_x = max(50, min(width - box_w, node_x - 350))
        
        # Cyber Box
        draw.rectangle([(box_x, box_y), (box_x + box_w, box_y + box_h)], fill=(16, 20, 32), outline=item["color"], width=2)
        
        # Date Tag
        draw.rectangle([(box_x, box_y), (box_x + 200, box_y + box_h)], fill=(22, 28, 45))
        draw.text((box_x + 30, box_y + 70), item.get("month", "AUG"), fill=item["color"], font=font_month)
        draw.text((box_x + 40, box_y + 190), item.get("year", "2025"), fill=(180, 200, 220), font=font_title)
        
        # Title & Desc
        def draw_truncated(draw_obj, pos, txt, fill_col, fnt, max_w):
            if not txt: return
            w = fnt.getlength(txt) if hasattr(fnt, 'getlength') else fnt.getbbox(txt)[2]
            if w <= max_w:
                draw_obj.text(pos, txt, fill=fill_col, font=fnt)
            else:
                while len(txt) > 0 and (fnt.getlength(txt + "...") if hasattr(fnt, 'getlength') else fnt.getbbox(txt + "...")[2]) > max_w:
                    txt = txt[:-1]
                draw_obj.text(pos, txt + "...", fill=fill_col, font=fnt)
        
        draw_truncated(draw, (box_x + 230, box_y + 30), title_txt, (255, 255, 255), font_title, max_width)
        
        # Text Wrapping (pixel-based)
        bio_text = item.get("desc", "Description of the event goes here.")
        bio_words = bio_text.split()
        lines = []
        cur_line = []
        
        for w in bio_words:
            test_line = " ".join(cur_line + [w])
            w_width = font_desc.getlength(test_line) if hasattr(font_desc, 'getlength') else font_desc.getbbox(test_line)[2]
            if w_width > max_width and cur_line:
                lines.append(" ".join(cur_line))
                cur_line = [w]
            else:
                cur_line.append(w)
        if cur_line:
            lines.append(" ".join(cur_line))

        ty = box_y + 110
        for l in lines:
            draw.text((box_x + 230, ty), l, fill=(180, 200, 220), font=font_desc)
            ty += 45

        # Header
        draw.rectangle([(30, 30), (width - 30, 100)], fill=(15, 18, 30))
        draw.text((60, 45), "🚀 DSSA ANNUAL ROADMAP & TIMELINE", fill=(200, 220, 240), font=font_div)
        draw.text((width - 350, 45), f"MILESTONE {i+1:02d} OF {len(roadmap):02d}", fill=item["color"], font=font_div)

        slides_np.append(np.array(base))
        if i == 0:
            base.save("public/media/roadmap-slideshow-thumbnail.jpg", "JPEG", quality=95)
            base.save("dist/media/roadmap-slideshow-thumbnail.jpg", "JPEG", quality=95)

    import time
    ts = int(time.time())
    out_tmp = f"public/media/tmp_roadmap_{ts}.mp4"
    out_public = f"public/media/roadmap-slideshow-{ts}.mp4"
    out_dist = f"dist/media/roadmap-slideshow-{ts}.mp4"
    
    print("Writing H.264 frames to MP4 video using imageio-ffmpeg...")
    try:
        writer = imageio.get_writer(out_tmp, fps=fps, codec='libx264', quality=8, pixelformat='yuv420p', macro_block_size=None)
        for slide_idx in range(len(roadmap)):
            curr_slide = slides_np[slide_idx]
            next_slide = slides_np[(slide_idx + 1) % len(roadmap)]
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
                import subprocess
                ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
                result = subprocess.run([
                    ffmpeg_exe, "-y", "-i", out_tmp,
                    "-c", "copy", "-movflags", "+faststart", out_public
                ], capture_output=True)
                if result.returncode != 0:
                    import shutil
                    shutil.copy2(out_tmp, out_public)
            except Exception as e:
                print("FFMPEG error:", e)
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
                    fl = next((p for p in pdata if p.get('slug') == 'annual-roadmap'), None)
                    if fl and 'video' in fl:
                        fl['video']['url'] = f'/media/roadmap-slideshow-{ts}.mp4?v={ts}'
                        fl['video']['thumbnail'] = f'/media/roadmap-slideshow-thumbnail.jpg?v={ts}'
                        fl['image'] = f'/media/roadmap-slideshow-thumbnail.jpg?v={ts}'
                        fl['video']['filename'] = f'roadmap-slideshow-{ts}.mp4'
                        fl['video']['filesize'] = os.path.getsize(out_public)
                    with open(fpath, 'w', encoding='utf-8') as f:
                        json.dump(pdata, f, indent=2)
    except Exception as e:
        print("Error in faststart/metadata update:", e)

if __name__ == "__main__":
    generate_roadmap_video()
