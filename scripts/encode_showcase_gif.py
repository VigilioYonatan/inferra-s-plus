import json
import os
from PIL import Image

def main():
    manifest_path = "temp_frames/manifest.json"
    if not os.path.exists(manifest_path):
        print("Manifest not found!")
        return

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    if not manifest:
        print("Manifest is empty!")
        return

    output_gif_path = "docs/assets/inferra-walkthrough.gif"
    copy_gif_path = "inferra-project/docs/assets/inferra-walkthrough.gif"
    os.makedirs(os.path.dirname(output_gif_path), exist_ok=True)
    os.makedirs(os.path.dirname(copy_gif_path), exist_ok=True)

    target_width = 1040
    quantized_frames = []
    durations = []

    print(f"Compiling {len(manifest)} frames into animated GIF...")

    for idx, item in enumerate(manifest):
        frame_path = item["path"]
        duration = item["duration"]
        if not os.path.exists(frame_path):
            continue

        with Image.open(frame_path) as img:
            rgb_image = img.convert("RGB")
            w, h = rgb_image.size
            target_height = int(h * (target_width / w))
            resized = rgb_image.resize((target_width, target_height), Image.Resampling.LANCZOS)
            quantized = resized.quantize(
                colors=256,
                method=Image.Quantize.MEDIANCUT,
                dither=Image.Dither.NONE
            )
            quantized_frames.append(quantized)
            durations.append(duration)

    if not quantized_frames:
        print("No valid frames processed!")
        return

    print(f"Saving GIF to {output_gif_path} (durations: {len(durations)} steps)...")
    quantized_frames[0].save(
        output_gif_path,
        save_all=True,
        append_images=quantized_frames[1:],
        optimize=True,
        duration=durations,
        loop=0
    )

    # Copy to inferra-project/docs/assets
    with open(output_gif_path, "rb") as src, open(copy_gif_path, "wb") as dst:
        dst.write(src.read())

    gif_size = os.path.getsize(output_gif_path)
    print(f"GIF compiled successfully: {output_gif_path} ({gif_size / 1024:.1f} KB)")

if __name__ == "__main__":
    main()
