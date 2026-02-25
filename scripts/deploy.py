import os
import subprocess
import tarfile
import sys

# Configuration
HOST = "ec2-13-48-67-55.eu-north-1.compute.amazonaws.com"
USER = "ubuntu"
KEY_FILE = "jorge-aws.pem"
REMOTE_DIR = "~/SGflota"
ARCHIVE_NAME = "deploy_package.tar.gz"

# Files/Folders to exclude from the deployment
EXCLUDES = {
    'node_modules', 
    '.next', 
    '.git', 
    '.vscode', 
    '.idea', 
    ARCHIVE_NAME, 
    '.env',          # Keep server-side env vars
    KEY_FILE,        # Don't upload the auth key
    'scripts/deploy.py' # Don't need the deploy script itself on server
}

def filter_tar(tarinfo):
    name = tarinfo.name
    # Exclude public/uploads but keep public/
    if "public/uploads" in name.replace("\\", "/"):
        return None
    return tarinfo

def create_archive():
    print(f"Creating archive: {ARCHIVE_NAME}...")
    try:
        with tarfile.open(ARCHIVE_NAME, "w:gz") as tar:
            for item in os.listdir('.'):
                if item in EXCLUDES:
                    continue
                tar.add(item, filter=filter_tar)
    except Exception as e:
        print(f"Error creating archive: {e}")
        sys.exit(1)

def upload_and_deploy():
    print(f"Uploading {ARCHIVE_NAME} to {HOST}...")
    
    # 1. Upload
    scp_cmd = [
        "scp", 
        "-o", "StrictHostKeyChecking=no", 
        "-i", KEY_FILE, 
        ARCHIVE_NAME, 
        f"{USER}@{HOST}:~/"
    ]
    
    try:
        subprocess.check_call(scp_cmd)
    except subprocess.CalledProcessError:
        print("Error uploading file. Check SSH connection and key.")
        sys.exit(1)

    print("Executing remote deployment commands...")
    
    # 2. Remote Commands
    # We chain commands to ensure execution order and stop on error
    commands = [
        # Create directory if likely implies first run, but we just mkdir -p
        f"mkdir -p {REMOTE_DIR}",
        
        # Extract archive
        f"tar -xzf ~/{ARCHIVE_NAME} -C {REMOTE_DIR}",
        
        # Remove archive from home
        f"rm ~/{ARCHIVE_NAME}",
        
        # Go to directory
        f"cd {REMOTE_DIR}",
        
        # Install dependencies
        "echo 'Installing dependencies...'",
        "npm install",
        
        # Generate Prisma Client (needed after install/updates)
        "echo 'Generating Prisma Client...'",
        "npx prisma generate",
        
        # Build Next.js app
        "echo 'Building application...'",
        "npm run build",
        
        # Restart or Start PM2
        "echo 'Updating PM2 process...'",
        # Check if process exists, if so restart, else start
        "pm2 describe sgflota > /dev/null && pm2 reload sgflota || pm2 start npm --name 'sgflota' -- start",
        
        # Save PM2 list
        "pm2 save"
    ]
    
    remote_script = " && ".join(commands)
    
    ssh_cmd = [
        "ssh", 
        "-o", "StrictHostKeyChecking=no", 
        "-i", KEY_FILE, 
        f"{USER}@{HOST}", 
        remote_script
    ]
    
    try:
        subprocess.check_call(ssh_cmd)
        print("\n✅ Deployment successful!")
    except subprocess.CalledProcessError:
        print("\n❌ Deployment failed during remote execution.")
        sys.exit(1)

if __name__ == "__main__":
    if not os.path.exists(KEY_FILE):
        print(f"Error: Key file '{KEY_FILE}' not found.")
        sys.exit(1)
        
    try:
        create_archive()
        upload_and_deploy()
    except KeyboardInterrupt:
        print("\nDeployment cancelled.")
    finally:
        # Cleanup local archive
        if os.path.exists(ARCHIVE_NAME):
            os.remove(ARCHIVE_NAME)
