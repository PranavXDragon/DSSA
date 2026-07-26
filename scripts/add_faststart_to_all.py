import os, glob, shutil, imageio_ffmpeg

exe = imageio_ffmpeg.get_ffmpeg_exe()
print("Using ffmpeg binary:", exe)

mp4_files = glob.glob("public/media/*.mp4") + glob.glob("dist/media/*.mp4")
for fpath in set(mp4_files):
    if not os.path.exists(fpath):
        continue
    print("Processing:", fpath)
    tmp_path = fpath + ".tmp.mp4"
    ret = os.system(f'"{exe}" -y -i "{fpath}" -c copy -movflags +faststart "{tmp_path}" >nul 2>&1')
    if ret == 0 and os.path.exists(tmp_path) and os.path.getsize(tmp_path) > 0:
        shutil.move(tmp_path, fpath)
        print(" -> Added +faststart successfully to", fpath)
    else:
        if os.path.exists(tmp_path):
            try: os.remove(tmp_path)
            except: pass
        print(" -> Failed or already optimized:", fpath)
