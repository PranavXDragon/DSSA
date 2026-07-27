import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "backup"))
from generate_remaining_cinematic_videos import generate_cinematic_video

def generate_journey_video():
    generate_cinematic_video(
        "our-journey",
        "OUR JOURNEY",
        [
            {"title": "EXPERIENCE", "desc": "Every event adds a new chapter to our story.", "photo": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&auto=format&fit=crop&q=80", "color": [0, 240, 255]},
            {"title": "COMMUNITY", "desc": "DSSA continues to grow through every experience.", "photo": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1920&auto=format&fit=crop&q=80", "color": [255, 68, 119]}
        ],
        "journey"
    )

if __name__ == "__main__":
    generate_journey_video()
