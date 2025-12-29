# Initialize Git Repository

Due to path encoding issues with the Arabic characters in the directory name, please run these commands manually in PowerShell from the project root directory:

## Steps to Initialize Git

1. **Open PowerShell in the project directory** (`E:\Maktabat al‑Basīrah`)

2. **Initialize git repository:**
   ```powershell
   git init
   ```

3. **Add the remote:**
   ```powershell
   git remote add origin https://github.com/sylergy-zubair/Maktaba-al-Basirah.git
   ```

4. **Add all files:**
   ```powershell
   git add .
   ```

5. **Make initial commit:**
   ```powershell
   git commit -m "Initial commit"
   ```

6. **Push to GitHub:**
   ```powershell
   git branch -M main
   git push -u origin main
   ```

## Alternative: Use Short Path Name

If the above doesn't work due to path encoding, you can use the short path name:

1. **Find the short path:**
   ```cmd
   dir /x E:\ | findstr Maktabat
   ```

2. **Use that path with git:**
   ```powershell
   git -C "E:\MAKTAB~1" init
   git -C "E:\MAKTAB~1" remote add origin https://github.com/sylergy-zubair/Maktaba-al-Basirah.git
   git -C "E:\MAKTAB~1" add .
   git -C "E:\MAKTAB~1" commit -m "Initial commit"
   git -C "E:\MAKTAB~1" push -u origin main
   ```

## What's Already Done

- ✅ `.gitignore` file created
- ✅ Remote URL configured (if .git directory exists)

