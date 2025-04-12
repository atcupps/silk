chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GEMINI_QUERY") {
      // Replace this with actual Gemini API call
      console.log("Calling Gemini with", message.username, message.password);
  
      // Simulate async call
      setTimeout(() => {
        sendResponse({ message: `Gemini response for ${message.username}` });
      }, 1000);
  
      return true; // Keeps the message channel open
    }
  });
  