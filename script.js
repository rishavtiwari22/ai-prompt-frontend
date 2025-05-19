// Global variables
let currentScenario = '';
let currentDifficulty = 'beginner';
let userPrompt = '';
// Add minimum prompt length constant
const MINIMUM_PROMPT_LENGTH = 15;

// DOM elements - initialize these after DOM content is loaded
let levelSelectionSection;
let scenarioSection;
let userPromptsSection;
let feedbackSection;
let loader;

// Gemini API key - remove the hardcoded key for security
let API_KEY = '';

// Check API connectivity
async function checkApiConnectivity() {
    try {
        // Add mode: 'cors' explicitly to ensure CORS request is made properly
        const response = await fetch('https://ai-prompt-backend.vercel.app/api/health', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log("API server is running:", data);
            return true;
        } else {
            console.warn("API server not responding correctly. Status:", response.status);
            return false;
        }
    } catch (error) {
        console.warn("Could not connect to API server:", error);
        console.log("If this is a CORS error, check that the backend CORS configuration includes your frontend domain");
        return false;
    }
}
    
// Button event listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Check API connectivity when the app loads
    await checkApiConnectivity();
    // Initialize DOM elements
    levelSelectionSection = document.getElementById('level-selection-section');
    scenarioSection = document.getElementById('scenario-section');
    userPromptsSection = document.getElementById('user-prompts-section');
    feedbackSection = document.getElementById('feedback-section');
    loader = document.getElementById('loader');
    
    // Ensure loader is hidden on initial load
    hideLoader();
    
    // Add event listeners for level selection buttons
    document.querySelectorAll('.select-level-btn').forEach(button => {
        button.addEventListener('click', () => {
            currentDifficulty = button.getAttribute('data-level');
            saveToLocalStorage('currentDifficulty', currentDifficulty);
            generateScenario();
        });
        
        // Add keyboard focus handling
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });
    
    // Button event listeners
    document.getElementById('new-scenario').addEventListener('click', generateScenario);
    document.getElementById('continue-to-prompts').addEventListener('click', showUserPromptsSection);
    document.getElementById('analyze-prompts').addEventListener('click', analyzeUserPrompt);
    document.getElementById('try-again').addEventListener('click', generateScenario);
    document.getElementById('change-difficulty').addEventListener('click', showLevelSelection);
    
    // Add keyboard event listener to handle Enter key presses
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Add event listener to text area to handle Enter key with modifier keys
    const promptInput = document.querySelector('.user-prompt-input');
    if (promptInput) {
        promptInput.addEventListener('keydown', (e) => {
            // Allow Shift+Enter for line breaks 
            if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                // If the current section is the user prompts section and the analyze button is available
                if (userPromptsSection.classList.contains('active-section')) {
                    e.preventDefault();
                    document.getElementById('analyze-prompts').click();
                }
            }
        });
    }
    
    // Load any saved data from localStorage
    loadSavedData();

    // Setup API key configuration
    setupApiKeyConfiguration();
});

/**
 * Handle keyboard shortcuts for the app
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleKeyboardShortcuts(e) {
    // Don't trigger shortcuts when typing in text fields
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        return;
    }
    
    // Handle Enter key based on which section is active
    if (e.key === 'Enter') {
        if (levelSelectionSection.classList.contains('active-section')) {
            // Find the focused button or default to first
            const focusedButton = document.activeElement;
            if (focusedButton && focusedButton.classList.contains('select-level-btn')) {
                focusedButton.click();
            }
        } else if (scenarioSection.classList.contains('active-section')) {
            document.getElementById('continue-to-prompts').click();
        } else if (userPromptsSection.classList.contains('active-section')) {
            document.getElementById('analyze-prompts').click();
        } else if (feedbackSection.classList.contains('active-section')) {
            document.getElementById('try-again').click();
        }
    }
    
    // Add shortcut keys for common actions
    if (e.key === 'n' && e.ctrlKey) {
        // Ctrl+N: New scenario
        e.preventDefault();
        document.getElementById('new-scenario').click();
    } else if (e.key === 'Escape') {
        // Escape: Go back to level selection
        e.preventDefault();
        showLevelSelection();
    }
}

// Function to show loader
function showLoader() {
    if (loader) {
        loader.classList.remove('hidden');
    }
}

// Function to hide loader
function hideLoader() {
    if (loader) {
        loader.classList.add('hidden');
    }
}

// Function to switch between sections
function showSection(section) {
    if (!section) return;
    
    // Hide all sections
    if (levelSelectionSection) levelSelectionSection.classList.remove('active-section');
    if (scenarioSection) scenarioSection.classList.remove('active-section');
    if (userPromptsSection) userPromptsSection.classList.remove('active-section');
    if (feedbackSection) feedbackSection.classList.remove('active-section');
    
    // Show the requested section   
    section.classList.add('active-section');
}

// Show level selection section
function showLevelSelection() {
    showSection(levelSelectionSection);
}

// Generate a new scenario based on difficulty
function generateScenario() {
    try {
        // Update the difficulty badge
        const difficultyBadge = document.getElementById('difficulty-badge');
        if (difficultyBadge) {
            difficultyBadge.textContent = capitalizeFirstLetter(currentDifficulty);
            difficultyBadge.className = `difficulty-badge ${currentDifficulty}`;
        }
        
        // Get a random scenario from the predefined list
        currentScenario = getRandomScenario(currentDifficulty);
        saveToLocalStorage('currentScenario', currentScenario);
        
        // Display scenario
        const scenarioDisplay = document.getElementById('scenario-display');
        if (scenarioDisplay) {
            scenarioDisplay.textContent = currentScenario;
        }
        
        // Update scenario reminder in prompts section
        const scenarioReminder = document.getElementById('scenario-reminder');
        if (scenarioReminder) {
            scenarioReminder.textContent = `Scenario: ${currentScenario}`;
        }
        
        showSection(scenarioSection);
        
    } catch (error) {
        console.error('Error generating scenario:', error);
        alert('There was an error generating a scenario. Please try again.');
    }
}

// Show user prompts section
function showUserPromptsSection() {
    // Clear any previous prompt
    const promptInput = document.querySelector('.user-prompt-input');
    if (promptInput) {
        promptInput.value = '';
    }
    
    // Update scenario reminder
    const scenarioReminder = document.getElementById('scenario-reminder');
    if (scenarioReminder) {
        scenarioReminder.textContent = `Scenario: ${currentScenario}`;
    }
    
    showSection(userPromptsSection);
}

// Analyze user prompt
async function analyzeUserPrompt() {
    const promptInput = document.querySelector('.user-prompt-input');
    if (!promptInput) return;
    
    const promptText = promptInput.value.trim();
    
    if (promptText === '') {
        alert('Please write a prompt before getting feedback.');
        return;
    }
    
    userPrompt = promptText;
    saveToLocalStorage('userPrompt', userPrompt);
    
    // Check for minimum length before proceeding
    if (promptText.length < MINIMUM_PROMPT_LENGTH) {
        displayMinimumLengthFeedback();
        return;
    }
    
    showLoader();
    
    try {
        // Get AI feedback on user prompt
        const feedback = await getPromptFeedback(currentScenario, currentDifficulty, userPrompt);
        
        // Check if feedback contains a fallback flag (indicates API failure)
        if (feedback.isFallback === true) {
            hideLoader();
            displayApiErrorMessage(feedback);
            // Keep user on the prompt writing page
            showSection(userPromptsSection);
            return;
        }
        
        // Display feedback and proceed to feedback section
        displayFeedback(feedback);
        
        hideLoader();
        showSection(feedbackSection);
        
    } catch (error) {
        console.error('Error analyzing prompt:', error);
        hideLoader();
        displayApiErrorMessage({error: error.message || "Network or server error"});
        // Keep user on the prompt writing page
        showSection(userPromptsSection);
    }
}

// Display feedback for prompts that are too short
function displayMinimumLengthFeedback() {
    const zeroScoreFeedback = {
        overallScore: 0,
        detailedFeedback: `Your prompt is too short (less than ${MINIMUM_PROMPT_LENGTH} characters). A good prompt needs to provide enough context and details to guide the AI. Please expand your prompt with more specific instructions and details.`,
        skillRatings: [
            { name: "Clarity", score: 0 },
            { name: "Specificity", score: 0 },
            { name: "Structure", score: 0 },
            { name: "Context", score: 0 },
            { name: "Grammar & Syntax", score: 0 }
        ],
        improvementTips: [
            "Make your prompt at least 15 characters long",
            "Include specific details about what you want",
            "Provide context about the purpose of your request",
            "Specify the format or structure you need",
            "Consider mentioning your target audience or tone requirements"
        ],
        examplePrompts: [
            `For the scenario: "${currentScenario}"\n\nPlease help me create a [specific output] with the following sections:\n1. [Section 1]\n2. [Section 2]\n3. [Section 3]\n\nThe tone should be [formal/informal/etc.] and the length approximately [length]. The target audience is [audience].`,
            
            `I need assistance with "${currentScenario}". Please include:\n- [Specific element 1]\n- [Specific element 2]\n- [Specific element 3]\n\nFormat it as a [document type] and optimize it for [purpose/audience]. Avoid [what to avoid].`
        ]
    };
    
    displayFeedback(zeroScoreFeedback);
    showSection(feedbackSection);
}

// Display feedback from AI
function displayFeedback(feedback) {
    // Set overall score
    const totalScoreElement = document.getElementById('total-score');
    if (totalScoreElement) {
        totalScoreElement.textContent = feedback.overallScore;
    }
    
    // Display detailed feedback
    const feedbackContent = document.getElementById('feedback-content');
    if (feedbackContent) {
        feedbackContent.innerHTML = `<p>${feedback.detailedFeedback}</p>`;
    }
    
    // Display skill ratings
    const skillBars = document.querySelector('.skill-bars');
    if (skillBars) {
        skillBars.innerHTML = '';
        
        for (const skill of feedback.skillRatings) {
            const skillBar = document.createElement('div');
            skillBar.className = 'skill-bar';
            skillBar.innerHTML = `
                <div class="label">
                    <span>${skill.name}</span>
                    <span>${skill.score}/10</span>
                </div>
                <div class="progress">
                    <div class="progress-fill" style="width: ${skill.score * 10}%"></div>
                </div>
            `;
            skillBars.appendChild(skillBar);
        }
    }
    
    // Display improvement tips
    const tipsList = document.getElementById('tips-list');
    if (tipsList) {
        tipsList.innerHTML = '';
        
        feedback.improvementTips.forEach(tip => {
            const listItem = document.createElement('li');
            listItem.textContent = tip;
            tipsList.appendChild(listItem);
        });
    }
    
    // Display example better prompts
    const betterPrompts = document.getElementById('better-prompts');
    if (betterPrompts) {
        betterPrompts.innerHTML = '';
        
        feedback.examplePrompts.forEach((prompt, index) => {
            const examplePrompt = document.createElement('div');
            examplePrompt.className = 'example-prompt';
            examplePrompt.innerHTML = `
                <h4>Example ${index + 1}</h4>
                <p>${prompt}</p>
            `;
            betterPrompts.appendChild(examplePrompt);
        });
    }
}

// Reset the app to level selection
function resetApp() {
    currentScenario = '';
    userPrompt = '';
    
    // Clear localStorage
    localStorage.removeItem('currentScenario');
    localStorage.removeItem('userPrompt');
    
    showSection(levelSelectionSection);
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Save data to localStorage
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Load data from localStorage
function loadSavedData() {
    try {
        const savedDifficulty = localStorage.getItem('currentDifficulty');
        const savedScenario = localStorage.getItem('currentScenario');
        const savedPrompt = localStorage.getItem('userPrompt');
        
        if (savedDifficulty) {
            currentDifficulty = JSON.parse(savedDifficulty);
        }
        
        if (savedScenario) {
            currentScenario = JSON.parse(savedScenario);
            
            // If we have a saved scenario, we can show the scenario section
            if (currentScenario) {
                const scenarioDisplay = document.getElementById('scenario-display');
                const difficultyBadge = document.getElementById('difficulty-badge');
                
                if (scenarioDisplay) {
                    scenarioDisplay.textContent = currentScenario;
                }
                
                if (difficultyBadge) {
                    difficultyBadge.textContent = capitalizeFirstLetter(currentDifficulty);
                    difficultyBadge.className = `difficulty-badge ${currentDifficulty}`;
                }
            }
        }
        
        if (savedPrompt) {
            userPrompt = JSON.parse(savedPrompt);
            const promptInput = document.querySelector('.user-prompt-input');
            if (promptInput) {
                promptInput.value = userPrompt;
            }
        }
        
        // Always start from level selection
        showSection(levelSelectionSection);
        
    } catch (error) {
        console.error('Error loading saved data:', error);
        resetApp();
    }
}

// Function to get feedback on user prompt
async function getPromptFeedback(scenario, difficulty, userPrompt) {
    // Check for minimum length first
    if (userPrompt.length < MINIMUM_PROMPT_LENGTH) {
        return {
            overallScore: 0,
            detailedFeedback: `Your prompt is too short (less than ${MINIMUM_PROMPT_LENGTH} characters). A good prompt needs to provide enough context and details to guide the AI. Please expand your prompt with more specific instructions and details.`,
            skillRatings: [
                { name: "Clarity", score: 0 },
                { name: "Specificity", score: 0 },
                { name: "Structure", score: 0 },
                { name: "Context", score: 0 },
                { name: "Grammar & Syntax", score: 0 }
            ],
            improvementTips: [
                "Make your prompt at least 15 characters long",
                "Include specific details about what you want",
                "Provide context about the purpose of your request",
                "Specify the format or structure you need",
                "Consider mentioning your target audience or tone requirements"
            ],
            examplePrompts: [
                `For the scenario: "${scenario}"\n\nPlease help me create a [specific output] with the following sections:\n1. [Section 1]\n2. [Section 2]\n3. [Section 3]\n\nThe tone should be [formal/informal/etc.] and the length approximately [length]. The target audience is [audience].`,
                
                `I need assistance with "${scenario}". Please include:\n- [Specific element 1]\n- [Specific element 2]\n- [Specific element 3]\n\nFormat it as a [document type] and optimize it for [purpose/audience]. Avoid [what to avoid].`
            ]
        };
    }
    
    try {
        // Check if API server is available
        const isApiAvailable = await checkApiConnectivity();
        
        if (!isApiAvailable) {
            console.log("API server not available, using fallback feedback");
            return generateFallbackFeedback(scenario, difficulty, userPrompt);
        }
        
        console.log("Using backend API to get feedback");
        
        try {
            // Get API key from localStorage
            const apiKey = localStorage.getItem('geminiApiKey');
            console.log("API key available:", apiKey ? "Yes (from localStorage)" : "No");
            
            // Call the backend API
            const response = await fetch('https://ai-prompt-backend.vercel.app/api/analyze', {
                method: 'POST',
                mode: 'cors',  // Explicitly set CORS mode
                cache: 'no-cache', // Don't use cached responses
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    scenario,
                    difficulty,
                    userPrompt,
                    apiKey: apiKey // Send API key if stored locally
                })
            });
            
            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    console.error("API error:", errorData);
                    return { 
                        ...generateFallbackFeedback(scenario, difficulty, userPrompt), 
                        isFallback: true,
                        error: errorData.error || `API returned status: ${response.status}`
                    };
                } catch (jsonError) {
                    // If we can't parse the error response as JSON
                    console.error("API error:", response.status, response.statusText);
                    return { 
                        ...generateFallbackFeedback(scenario, difficulty, userPrompt), 
                        isFallback: true,
                        error: `API error: ${response.status} ${response.statusText}`
                    };
                }
            }
            
            try {
                const feedbackData = await response.json();
                console.log("API feedback:", feedbackData);
                return feedbackData;
            } catch (parseError) {
                console.error("Error parsing API response:", parseError);
                return {
                    ...generateFallbackFeedback(scenario, difficulty, userPrompt),
                    isFallback: true,
                    error: "Failed to parse API response"
                };
            }
            
        } catch (apiError) {
            console.error("API connection error:", apiError);
            return { ...generateFallbackFeedback(scenario, difficulty, userPrompt), isFallback: true };
        }
    } catch (error) {
        console.error("Error getting feedback:", error);
        return { ...generateFallbackFeedback(scenario, difficulty, userPrompt), isFallback: true };
    }
}

// Generate fallback feedback if API call fails
function generateFallbackFeedback(scenario, difficulty, userPrompt) {
    // Check for minimum length first
    if (userPrompt.length < MINIMUM_PROMPT_LENGTH) {
        return {
            overallScore: 0,
            detailedFeedback: `Your prompt is too short (less than ${MINIMUM_PROMPT_LENGTH} characters). A good prompt needs to provide enough context and details to guide the AI. Please expand your prompt with more specific instructions and details.`,
            skillRatings: [
                { name: "Clarity", score: 0 },
                { name: "Specificity", score: 0 },
                { name: "Structure", score: 0 },
                { name: "Context", score: 0 },
                { name: "Grammar & Syntax", score: 0 }
            ],
            improvementTips: [
                "Make your prompt at least 15 characters long",
                "Include specific details about what you want",
                "Provide context about the purpose of your request",
                "Specify the format or structure you need",
                "Consider mentioning your target audience or tone requirements"
            ],
            examplePrompts: [
                `For the scenario: "${scenario}"\n\nPlease help me create a [specific output] with the following sections:\n1. [Section 1]\n2. [Section 2]\n3. [Section 3]\n\nThe tone should be [formal/informal/etc.] and the length approximately [length]. The target audience is [audience].`,
                
                `I need assistance with "${scenario}". Please include:\n- [Specific element 1]\n- [Specific element 2]\n- [Specific element 3]\n\nFormat it as a [document type] and optimize it for [purpose/audience]. Avoid [what to avoid].`
            ]
        };
    }
    
    // Basic prompt quality analysis (simplified)
    const wordCount = userPrompt.split(/\s+/).length;
    const hasSpecificInstructions = /step|format|structure|include|specific|detail/i.test(userPrompt);
    const hasContext = userPrompt.length > scenario.length + 20;
    const isDetailed = wordCount > 30;
    
    let overallScore;
    if (wordCount < 15) {
        overallScore = difficulty === 'beginner' ? 3 : difficulty === 'intermediate' ? 2 : 1;
    } else if (hasSpecificInstructions && isDetailed) {
        overallScore = difficulty === 'beginner' ? 8 : difficulty === 'intermediate' ? 7 : 6;
    } else {
        overallScore = difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 4 : 3;
    }
    
    // Add a flag to indicate this is fallback feedback
    return {
        overallScore: overallScore,
        detailedFeedback: `This is a fallback analysis due to API connection issues. Your prompt for the "${scenario}" scenario has ${wordCount} words. ${hasSpecificInstructions ? "It includes some specific instructions, which is good." : "It lacks specific instructions."} ${isDetailed ? "It has good detail." : "It needs more detail."} For ${difficulty} level prompts, we recommend ${difficulty === 'advanced' ? 'very detailed instructions with clear structure and constraints' : difficulty === 'intermediate' ? 'specific instructions with clear goals and format requirements' : 'clear and simple instructions'}.`,
        skillRatings: [
            { name: "Clarity", score: hasSpecificInstructions ? 7 : 4 },
            { name: "Specificity", score: isDetailed ? 6 : 3 },
            { name: "Structure", score: userPrompt.includes('\n') ? 7 : 4 },
            { name: "Context", score: hasContext ? 6 : 3 },
            { name: "Grammar & Syntax", score: 6 }
        ],
        improvementTips: [
            "Add more specific instructions about the format you want",
            "Include more context about the purpose of this request",
            "Break down complex requests into bullet points or numbered steps",
            "Specify any constraints or limitations",
            "Consider what might be misunderstood and clarify those points"
        ],
        examplePrompts: [
            `For the scenario: "${scenario}"\n\nPlease help me create a [specific output] with the following sections:\n1. [Section 1]\n2. [Section 2]\n3. [Section 3]\n\nThe tone should be [formal/informal/etc.] and the length approximately [length]. The target audience is [audience].`,
            
            `I need assistance with "${scenario}". Please include:\n- [Specific element 1]\n- [Specific element 2]\n- [Specific element 3]\n\nFormat it as a [document type] and optimize it for [purpose/audience]. Avoid [what to avoid].`
        ],
        isFallback: true
    };
}

// Function to validate an API key without a UI test button
async function validateApiKey(apiKey) {
    if (!apiKey) {
        return {
            success: false,
            message: "No API key provided."
        };
    }

    try {
        // Make a simple request just to verify the key works
        const response = await fetch('https://ai-prompt-backend.vercel.app/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                scenario: "API key validation",
                difficulty: "beginner",
                userPrompt: "This is a validation test for the API key.",
                apiKey: apiKey
            })
        });

        const data = await response.json();
        
        // Check if there was an API key related error
        if (!response.ok) {
            if (data.error && (
                data.error.includes("API key") || 
                data.error.includes("authentication") || 
                data.error.includes("invalid") || 
                data.error.includes("unauthorized")
            )) {
                return {
                    success: false,
                    message: "API key validation failed: " + data.error
                };
            }
            
            return {
                success: false,
                message: "Connection test failed: " + (data.error || "Unknown error")
            };
        }

        // If we got a valid response with a score, the key works
        if (data.overallScore !== undefined) {
            return {
                success: true,
                message: "API key validated successfully!"
            };
        } else if (data.isFallback) {
            return {
                success: false,
                message: "API key may be invalid. Server returned fallback response."
            };
        } else {
            return {
                success: false,
                message: "Unexpected response format. Please try again."
            };
        }
    } catch (error) {
        console.error("API validation error:", error);
        return {
            success: false,
            message: "Connection error: " + (error.message || "Unknown error")
        };
    }
}

// Add a settings modal to configure the API key with better error handling
function setupApiKeyConfiguration() {
    // Create the settings button
    const settingsButton = document.createElement('button');
    settingsButton.id = 'settings-button';
    settingsButton.className = 'settings-button';
    settingsButton.innerHTML = '<i class="fas fa-cog"></i> Settings';
    document.querySelector('.container').appendChild(settingsButton);
    
    // Create the modal HTML
    const modalHTML = `
        <div id="settings-modal" class="modal hidden">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>API Key Configuration</h2>
                <div class="api-form">
                    <label for="api-key-input">Enter your Gemini API Key:</label>
                    <input type="password" id="api-key-input" placeholder="Enter API Key...">
                    <div class="api-info">
                        Need an API key? Get one at <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a>.
                        <div class="api-note">Your API key is stored locally in your browser and is never sent to our servers.</div>
                    </div>
                    <div id="api-status" class="api-status"></div>
                    <button id="save-api-key">Save API Key</button>
                </div>
                <div class="api-troubleshooting">
                    <h3>Troubleshooting</h3>
                    <ul>
                        <li>Make sure you've created an API key in the Google AI Studio.</li>
                        <li>Check that you've copied the full API key correctly.</li>
                        <li>Ensure your API key has access to the Gemini models.</li>
                    </ul>
                    <button id="use-fallback-mode" class="fallback-button">Continue Without API Key</button>
                </div>
            </div>
        </div>
    `;
    
    // Append the modal to the body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Get modal elements
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.querySelector('.close-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveBtn = document.getElementById('save-api-key');
    const apiStatus = document.getElementById('api-status');
    const useFallbackBtn = document.getElementById('use-fallback-mode');
    
    // Load saved API key if it exists
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    } else {
        // Show API key dialog on page load if no API key is saved
        setTimeout(() => {
            modal.classList.remove('hidden');
        }, 500); // Small delay to ensure the modal appears after page load
    }
    
    // Open modal when settings button is clicked
    settingsButton.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });
    
    // Close modal when close button is clicked
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
    
    // Save API key
    saveBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('geminiApiKey', apiKey);
            apiStatus.textContent = 'API key saved successfully!';
            apiStatus.className = 'api-status success';
            document.getElementById('api-notification').style.display = 'none';
            
            // Delay closing modal for feedback
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 1500);
        } else {
            apiStatus.textContent = 'Please enter an API key';
            apiStatus.className = 'api-status error';
        }
    });
    
    // Use fallback mode
    useFallbackBtn.addEventListener('click', () => {
        localStorage.removeItem('geminiApiKey');
        apiStatus.textContent = 'Using fallback mode (limited features)';
        apiStatus.className = 'api-status';
        document.getElementById('api-notification').style.display = 'none';
        
        // Delay closing modal for feedback
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 1500);
    });
}

// Display API error message to user
function displayApiErrorMessage(errorDetails = {}) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-notification';
    
    // Create a more helpful error message based on the details
    let errorMessage = "We couldn't analyze your prompt at this time.";
    let solutionMessage = "Please check your API key settings or try again later.";
    let showApiSettingsButton = true;
    
    if (errorDetails.error) {
        if (typeof errorDetails.error === 'string') {
            if (errorDetails.error.includes("API key") || 
                errorDetails.error.includes("invalid") || 
                errorDetails.error.includes("unauthorized") || 
                errorDetails.error.includes("authentication")) {
                errorMessage = "There's an issue with the API key.";
                solutionMessage = "Please check that you've entered a valid Gemini API key in Settings.";
            } else if (errorDetails.error.includes("fetch") || errorDetails.error.includes("Failed to fetch")) {
                errorMessage = "Couldn't connect to the backend server.";
                solutionMessage = "Please make sure the backend server is running on http://localhost:5000";
                showApiSettingsButton = false;
            } else if (errorDetails.error.includes("rate limit") || errorDetails.error.includes("quota")) {
                errorMessage = "API rate limit exceeded.";
                solutionMessage = "You've reached the usage limit for your API key. Please try again later.";
                showApiSettingsButton = false;
            }
        }
    }
    
    let buttonHtml = '';
    if (showApiSettingsButton) {
        buttonHtml = `<button id="config-api-key-error" class="subtle-button">
                        <i class="fas fa-cog"></i> Configure API Key
                      </button>`;
    }
    
    errorContainer.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-circle"></i>
            <p><strong>AI Analysis Failed</strong></p>
            <p>${errorMessage}</p>
            <p>${solutionMessage}</p>
            ${buttonHtml}
        </div>
    `;
    
    // Add to user prompts section
    const userPromptsSection = document.getElementById('user-prompts-section');
    
    // Remove any existing error messages first
    const existingError = userPromptsSection.querySelector('.error-notification');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error at the top of the section
    const firstElement = userPromptsSection.firstChild;
    userPromptsSection.insertBefore(errorContainer, firstElement);
    
    // Add event listener for the Configure API Key button
    const configButton = errorContainer.querySelector('#config-api-key-error');
    if (configButton) {
        configButton.addEventListener('click', () => {
            document.getElementById('settings-button').click();
        });
    }
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (errorContainer.parentNode) {
            errorContainer.remove();
        }
    }, 20000);
}
