import imageio_ffmpeg, subprocess
ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
result = subprocess.run([
    ffmpeg_exe, "-y", "-i", "public/media/roadmap-slideshow-1785091357.mp4", 
    "-c", "copy", "-movflags", "+faststart", "public/media/roadmap-slideshow-1785091357-faststart.mp4"
], capture_output=True, text=True)
print("Return code:", result.returncode)
print("Stdout:", result.stdout)
print("Stderr:", result.stderr)
