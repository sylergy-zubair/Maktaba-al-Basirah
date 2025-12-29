# Fix Git Push Permission Error

## The Problem
You're authenticated as `azubair2012` but trying to push to `sylergy-zubair/Maktaba-al-Basirah.git`, which causes a 403 permission error.

## Solutions

### Option 1: Change Remote to Your Account (Recommended if you own the repo)

If `sylergy-zubair` is your account or you want to use your own account:

```powershell
# Remove current remote
git remote remove origin

# Add remote with your username
git remote add origin https://github.com/azubair2012/Maktaba-al-Basirah.git

# Push to your repository
git push -u origin main
```

**Note:** You'll need to create the repository `Maktaba-al-Basirah` on GitHub first if it doesn't exist.

### Option 2: Use Personal Access Token (PAT)

If you need to push to `sylergy-zubair/Maktaba-al-Basirah.git`:

1. **Create a Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate a new token with `repo` permissions
   - Copy the token

2. **Update remote URL with token:**
   ```powershell
   git remote set-url origin https://YOUR_TOKEN@github.com/sylergy-zubair/Maktaba-al-Basirah.git
   ```

3. **Or use token when pushing:**
   ```powershell
   git push -u origin main
   # When prompted for password, paste your token
   ```

### Option 3: Use SSH Instead of HTTPS

1. **Generate SSH key (if you don't have one):**
   ```powershell
   ssh-keygen -t ed25519 -C "studio.zubair@gamil.com"
   ```

2. **Add SSH key to GitHub:**
   - Copy the public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste the key

3. **Change remote to SSH:**
   ```powershell
   git remote set-url origin git@github.com:sylergy-zubair/Maktaba-al-Basirah.git
   git push -u origin main
   ```

### Option 4: Check if Repository Exists

The repository might not exist yet. Check:
- https://github.com/sylergy-zubair/Maktaba-al-Basirah

If it doesn't exist, create it on GitHub first, then push.

## Quick Fix (Most Common)

If `sylergy-zubair` is your account, just update the remote:

```powershell
git remote set-url origin https://github.com/azubair2012/Maktaba-al-Basirah.git
git push -u origin main
```

Make sure the repository exists on GitHub under your account first!

