# How to Change the 3D Logo

The main spinning 3D logo in this project uses a proprietary, highly compressed binary format (`AT_logo.bin`). You cannot directly drag and drop standard 3D files into the assets folder.

However, I have built a custom converter script for you that will automatically package any standard `.obj` file into this custom `.bin` format!

## Instructions

1. **Get your 3D Logo:**
   You need a standard `.obj` file of your logo. It should have 3D geometry (thickness) if you want it to look like glass and catch the light correctly. You can create this in Blender or convert an SVG using online tools.

2. **Replace the Dummy File:**
   Place your 3D `.obj` file in the main folder of this project (`a:\ready\activetheory\`) and name it **exactly**:
   `my_logo.obj`
   *(There is currently a dummy Cube file there, just overwrite it).*

3. **Run the Converter:**
   Open a terminal in the project folder and run:
   ```bash
   node scripts/convert-logo.cjs
   ```

4. **Done!**
   The script will compress your 3D model, add the proprietary engine headers, and overwrite the `public/assets/geometry/logo/AT_logo.bin` file.

   Just refresh the page, and you will see your new custom 3D logo spinning in the center of the screen!
