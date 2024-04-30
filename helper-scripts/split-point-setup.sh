echo "cloning repo..."
sudo apt install git -y
TARGET_DIR="/home/kage/Desktop/splitPoint/repo"
REPO_URL="https://github.com/kage-mo/SplitPoint-Project"
git clone "$REPO_URL" "$TARGET_DIR"
echo "repo successfuly cloned..."

 
SCRIPTS_FOLDER="$TARGET_DIR/Bash-Scripts"
chmod -R +x "$SCRIPTS_FOLDER"
# Iterate over each file in the folder
for script in "$SCRIPTS_FOLDER"/*; do
    # Check if the file is a regular file and executable
    if [ -x "$script" ] && [ -f "$script" ]; then
        # Execute the script
        echo "Running script: $script"
        "$script"
        echo "Script execution finished."
    else
        echo "Skipping execution of file: $script"
    fi
done