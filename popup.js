// Get references to the UI elements in popup.html
const extractBtn = document.getElementById('extractBtn');
const commentCountInput = document.getElementById('commentCount');
const statusEl = document.getElementById('status');

/**
 * Event listener for the extract button click.
 */
extractBtn.addEventListener('click', async () => {
    // Get the current active tab in the browser
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if the current tab is a YouTube video page
    if (!tab.url || !tab.url.includes("youtube.com/watch")) {
        updateStatus("Error: Not on a YouTube video page.", 'red');
        return;
    }

    // Get the desired number of comments from the input field
    const targetCount = parseInt(commentCountInput.value, 10);
    if (isNaN(targetCount) || targetCount <= 0) {
        updateStatus("Error: Please enter a valid number.", 'red');
        return;
    }

    // Update the UI to show the process has started
    updateStatus('Starting extraction, please wait...', 'black');
    extractBtn.disabled = true;

    // Execute the main script on the page
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: injectedScript,
            args: [targetCount] // Pass the target count to the script
        });
        // The popup will close automatically after injection,
        // as the main work happens on the YouTube page itself.
        updateStatus('Extraction in progress on the page...', 'green');
        setTimeout(() => window.close(), 3000);
    } catch (err) {
        updateStatus('Error: Failed to inject script.', 'red');
        console.error("Script injection failed: ", err);
        extractBtn.disabled = false;
    }
});

/**
 * Updates the status message in the popup.
 * @param {string} message - The message to display.
 * @param {string} color - The color of the text.
 */
function updateStatus(message, color) {
    statusEl.textContent = message;
    statusEl.style.color = color;
}


/**
 * This is the entire script that gets injected and executed on the YouTube page.
 * It's self-contained and includes all necessary logic.
 * @param {number} targetCount - The number of comments to extract.
 */
function injectedScript(targetCount) {
    
    /**
     * Converts an array of objects to a CSV string and triggers a download.
     * @param {Array<Object>} data - The array of comment data.
     */
    const exportToCSV = (data) => {
        if (data.length === 0) {
            console.log("No data to export to CSV.");
            return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [];
        csvRows.push(headers.join(','));

        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header] !== null && row[header] !== undefined ? String(row[header]) : '';
                // Enclose in double quotes if the value contains a comma, double quote, or newline
                if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                    // Escape double quotes by doubling them
                    return `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        // Add BOM for proper Excel support with UTF-8 characters
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        // Create a filename-safe version of the video title
        const videoTitle = document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        link.setAttribute('href', url);
        link.setAttribute('download', `youtube_comments_${videoTitle.substring(0, 50)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`Comments exported to youtube_comments_${videoTitle}.csv`);
    };

    /**
     * Main function to scroll, extract comments, and export.
     * @param {number} count - The target number of comments.
     * @param {number} scrollDelay - Delay between scrolls in milliseconds.
     */
    const extractCommentsAndExport = async (count, scrollDelay = 2000) => {
        console.log(`YT Comment Exporter: Starting... Aiming for ${count} comments.`);
        alert(`YT Comment Exporter: Starting extraction.\nThe page will scroll automatically. Please do not close the tab.`);

        // Scrolls the page down to load more comments
        const scrollToBottomAndWait = async () => {
            window.scrollTo(0, document.documentElement.scrollHeight);
            console.log("YT Comment Exporter: Scrolling down...");
            await new Promise(resolve => setTimeout(resolve, scrollDelay));
        };
        
        // Ensure the comments section is visible to trigger loading
        const commentsElement = document.querySelector("#comments");
        if (commentsElement) {
            commentsElement.scrollIntoView({ behavior: 'smooth' });
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for scroll
        } else {
            console.error("YT Comment Exporter: Could not find the comments section (#comments).");
            alert("YT Comment Exporter: Could not find the comments section. Aborting.");
            return;
        }

        let commentThreads = document.querySelectorAll('ytd-comment-thread-renderer');
        let lastCommentCount = 0;
        let stableScrolls = 0;
        const maxStableScrolls = 5; // Stop after 5 scrolls with no new comments

        while (commentThreads.length < count) {
            lastCommentCount = commentThreads.length;
            await scrollToBottomAndWait();
            commentThreads = document.querySelectorAll('ytd-comment-thread-renderer');
            console.log(`YT Comment Exporter: Found ${commentThreads.length} comments so far.`);

            if (commentThreads.length === lastCommentCount) {
                stableScrolls++;
                console.log(`YT Comment Exporter: No new comments loaded. Attempt ${stableScrolls}/${maxStableScrolls}`);
            } else {
                stableScrolls = 0; // Reset counter if new comments are found
            }

            if (stableScrolls >= maxStableScrolls) {
                console.log("YT Comment Exporter: Stopping scroll. No new comments loaded after several attempts.");
                break;
            }
        }

        console.log(`YT Comment Exporter: Scrolling finished. Extracting data from ${commentThreads.length} comments.`);

        const extractedComments = [];
        // Slice the array to only process the target amount
        const threadsToProcess = Array.from(commentThreads).slice(0, count);

        threadsToProcess.forEach(thread => {
            const authorElement = thread.querySelector('#author-text');
            const commentElement = thread.querySelector('#content-text');
            const publishedTimeElement = thread.querySelector('yt-formatted-string.published-time-text a');
            const likesElement = thread.querySelector('#vote-count-middle');

            if (authorElement && commentElement) {
                extractedComments.push({
                    username: authorElement.textContent.trim(),
                    comment: commentElement.textContent.trim(),
                    published_time: publishedTimeElement ? publishedTimeElement.textContent.trim() : 'N/A',
                    likes: likesElement ? (likesElement.textContent.trim() || '0') : '0',
                });
            }
        });

        if (extractedComments.length > 0) {
            console.log(`YT Comment Exporter: Successfully extracted ${extractedComments.length} comments.`);
            console.table(extractedComments);
            exportToCSV(extractedComments);
            alert(`Extraction complete! ${extractedComments.length} comments have been saved to your downloads folder.`);
        } else {
            console.log("YT Comment Exporter: Could not extract any comments.");
            alert("YT Comment Exporter: Could not extract any comments. The page structure might have changed.");
        }
    };

    // Entry point for the injected script
    extractCommentsAndExport(targetCount);
}
