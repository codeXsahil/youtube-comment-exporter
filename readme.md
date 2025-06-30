YouTube Comment Exporter - Chrome Extension
A simple yet powerful Chrome extension to extract comments from any YouTube video and export them to a clean, organized CSV file. Perfect for data analysis, sentiment analysis, or simply archiving a discussion.

Features
One-Click Extraction: Easily start the extraction process from a clean, user-friendly popup.

Custom Comment Count: Specify exactly how many comments you want to extract.

Automatic Scrolling: The extension automatically scrolls the page to load the desired number of comments.

Comprehensive Data: Exports not just the comment text, but also the username, publish time, and like count.

CSV Export: Downloads the data in a universally compatible CSV format, ready for Excel, Google Sheets, or any data analysis tool.

Robust & Stable: Includes logic to handle cases where no new comments are loaded, preventing infinite loops.

User-Friendly Notifications: Uses browser alerts to keep you informed about the extraction progress and completion.

Screenshot
The clean UI of the YouTube Comment Exporter popup.

Installation
Since this extension is not on the Chrome Web Store, you can load it into your browser by following these steps:

Download the Repository:

Clone this repository: git clone https://github.com/your-username/youtube-comment-exporter.git

Or, download the ZIP file and extract it to a folder on your computer.

Open Chrome Extensions:

Open your Google Chrome browser.

Navigate to chrome://extensions in the address bar.

Enable Developer Mode:

In the top-right corner of the Extensions page, toggle the "Developer mode" switch ON.

Load the Extension:

Click the "Load unpacked" button that appears.

In the file selection dialog, navigate to and select the folder where you cloned or extracted the repository (the folder containing manifest.json).

The "YouTube Comment Exporter" will now appear in your list of extensions.

How to Use
Navigate to a YouTube Video: Go to any video page on youtube.com.

Open the Extension: Click on the puzzle piece icon in your Chrome toolbar and select the "YouTube Comment Exporter" icon. You can pin it for easier access.

Set the Amount: In the popup, enter the desired number of comments you wish to extract (e.g., 500).

Start Extraction: Click the "Extract & Export to CSV" button.

Wait: An alert will notify you that the process is starting. The page will scroll automatically to load comments. Please do not close the tab or navigate away.

Download: Once the extraction is complete, a final alert will appear, and a CSV file containing the comments will be automatically downloaded to your computer. The filename will be based on the video's title for easy identification.

Project Structure
/
├── icons
├── manifest.json          # Core file that defines the extension's properties and permissions
├── popup.html             # The HTML structure of the extension's popup UI
├── popup.js               # The JavaScript logic for the popup, handling user input and triggering the main script
└── README.md              # You are here!

The main extraction logic (injectedScript) is contained entirely within popup.js. This script is dynamically injected into the active YouTube tab when the user initiates the extraction.

Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

License
This project is licensed under the MIT License.