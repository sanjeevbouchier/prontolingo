# Linguascape Electron App

This is a Next.js application packaged as a desktop Electron app. Linguascape helps users learn new languages by generating quizzes and vocabulary lists from provided text.

## Features

- **Text Input:** Users can paste or type text into the application.
- **Language Learning:**
    - **Generate Vocabulary List:** Creates a list of important vocabulary words from the input text, along with their definitions and parts of speech.
    - **Generate Quiz:** Creates a multiple-choice quiz based on the input text and its vocabulary.
- **Text-to-Speech:** (If applicable, assuming based on component name `text-to-speech-button.tsx`) Users can hear the pronunciation of words or sentences.
- **Interactive Learning View:** Displays the original text alongside generated vocabulary and quizzes.

## Running the App

### Packaged Application

1.  **Download the application:**
    *   (Instructions for where to download the packaged app will be added here once available, e.g., from a releases page.)
2.  **Install the application:**
    *   **Windows:** Run the `.exe` installer.
    *   **macOS:** Open the `.dmg` file and drag the application to your Applications folder.
    *   **Linux:** The `AppImage` can be made executable (`chmod +x <AppName>.AppImage`) and run directly.
3.  **Launch the application.**

### Development Mode

To run the application in development mode (requires Node.js and npm):

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server and Electron app:**
    ```bash
    npm run electron:dev
    ```
    This will open the application in a new window with developer tools enabled. The Next.js app will be served on `http://localhost:9002`.

## Building the Application

To build the application from source:

1.  **Ensure all dependencies are installed:**
    ```bash
    npm install
    ```
2.  **Run the build script:**
    ```bash
    npm run electron:build
    ```
    This will generate packaged application files in the `dist` directory.
