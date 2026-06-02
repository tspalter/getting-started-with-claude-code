Create a full-stack web application called AI Slide Deck Generator that converts Markdown content into beautiful slide presentations with AI enhancement capabilities.



Build a React.js frontend with Node.js/Express backend that allows users to:

* Input markdown content via text area or file upload
* Parse markdown into structured slides
* Preview slides with different themes
* Enhance content using OpenAI API
* Generate presentation and export them
* Real-time slide preview and editing





Backend: Node.js/Express

Dependencies: express, cors, multer, marked, openai, dotenv, jsdom, puppeteer

Dev: nodemon, concurrently

Port: 3001

Features: restful API, file uploads, AI integration, presentation generation



Frontend: React.js

features: step-by-step interface, real-time preview, theme selection





Project structure: We will have a root folder named getting-started-with-claude-code and inside we will have server and client folders.  The server folder must have a services folder where you need to store aiService.js, slideGenerator.js, exportService.js; Also inside the server folder we can have the index.js and utils folder for the markdownParser.js;



Then for the client we can also have a specific folder for services like api.js, then various components like slidePreview.js, themeSelector.js, and so on.



Moreover we can have sample.md for testing and uploads folder.



Security Considerations:

* file upload restrictions (only .md files, 10MB limit)
* input sanitization for Markdown content
* error message sanitization



Error handling:

* user-friendly error messages
* comprehensive try-catch blocks
* file upload validation and limit messages



