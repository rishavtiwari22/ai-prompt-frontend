/**
 * Large database of predefined scenarios organized by difficulty level
 * These scenarios are used instead of generating them with AI
 */

const scenarioDatabase = {
    beginner: [
        "Write a concise email summarizing yesterday's team meeting.",
        "Create a how-to guide for new employees on accessing the company portal.",
        "Draft a short announcement about the upcoming office relocation.",
        "Create a brief explanation of a concept for a high school student.",
        "Write notes summarizing the key points from an academic article.",
        "Write a welcome email to a new team member.",
        "Create a simple FAQ document for a product.",
        "Draft a meeting agenda for the weekly team standup.",
        "Write instructions for setting up a new workplace software.",
        "Create a brief product description for an online store.",
        "Write a short blog post about time management tips.",
        "Create a simple customer satisfaction survey.",
        "Draft a thank you email to a client after a successful meeting.",
        "Write a step-by-step guide for a basic office procedure.",
        "Create a brief summary of a business book for your colleagues.",
        "Draft a company newsletter announcing this month's achievements.",
        "Write an email requesting feedback on a recent project.",
        "Create a basic troubleshooting guide for common IT issues.",
        "Write a brief report on monthly department activities.",
        "Draft reminder emails for an upcoming company event.",
        "Create a simple project schedule with key milestones.",
        "Write a brief bio for a company website.",
        "Create a list of best practices for remote work.",
        "Write a short company announcement about a new policy.",
        "Draft a follow-up email after a client meeting.",
        "Create a brief product update announcement.",
        "Write a social media post for a company achievement.",
        "Draft a simple onboarding checklist for new hires.",
        "Create a brief summary of quarterly results for the team.",
        "Write a message requesting time off from your manager.",
        "Draft guidelines for using the new office printer system.",
        "Create a short proposal for a team building activity.",
        "Write a reminder about upcoming training sessions.",
        "Create a quick reference sheet for frequently used software tools.",
        "Draft a message asking colleagues for input on a project.",
        "Write a basic incident report for a minor workplace issue.",
        "Create a checklist for conference preparation.",
        "Draft an email confirming a business appointment.",
        "Write instructions for filling out expense reports.",
        "Create a brief overview of a new workplace initiative."
    ],
    intermediate: [
        "Create a detailed project status report for stakeholders with progress metrics.",
        "Draft a comprehensive training document for new software being implemented.",
        "Write a persuasive proposal for implementing a new work process.",
        "Develop a lesson plan for teaching a complex topic to college students.",
        "Create an analysis of research findings with recommendations for next steps.",
        "Develop a marketing strategy document for a product launch.",
        "Write a comprehensive performance review with specific examples and metrics.",
        "Create a detailed competitive analysis comparing key market players.",
        "Draft a crisis communication plan for potential business disruptions.",
        "Write a technical specification document for a software feature.",
        "Develop a comprehensive customer journey map with touchpoints and opportunities.",
        "Create a detailed content strategy for a website redesign.",
        "Write a case study showcasing a successful project implementation.",
        "Draft a change management communication plan for a system upgrade.",
        "Develop a comprehensive employee wellness program proposal.",
        "Create a detailed risk assessment for a new business venture.",
        "Write an in-depth analysis of customer feedback with actionable insights.",
        "Draft a comprehensive employee handbook section on remote work policies.",
        "Create a detailed business continuity plan for the operations team.",
        "Write a comprehensive project proposal with budget, timeline, and resource needs.",
        "Develop a detailed customer service training manual with scenarios.",
        "Create an engagement strategy for improving team collaboration.",
        "Write a departmental budget proposal with justifications for each line item.",
        "Draft a comprehensive vendor evaluation report with selection criteria.",
        "Create a thorough market research report on emerging industry trends.",
        "Develop a detailed recruitment strategy to address staffing challenges.",
        "Write a comprehensive social media content calendar with themes and goals.",
        "Create a detailed product roadmap for the next 12 months.",
        "Draft a comprehensive process improvement report with before/after metrics.",
        "Write a detailed technical troubleshooting guide for the support team.",
        "Create a thorough onboarding curriculum for new department members.",
        "Draft a comprehensive data security protocol document.",
        "Develop a detailed grant proposal for a community initiative.",
        "Create an in-depth analysis of operational inefficiencies with solutions.",
        "Write a comprehensive quality assurance testing plan for a new product.",
        "Draft a detailed business requirements document for system development.",
        "Create a thorough compliance audit report with findings and recommendations.",
        "Write an in-depth competitor SWOT analysis with strategic implications.",
        "Develop a comprehensive event planning document for a major company event.",
        "Create a detailed client proposal for a potential high-value project."
    ],
    advanced: [
        "Create a strategic business plan with market analysis, financials, and implementation timeline.",
        "Develop a comprehensive change management strategy for a company merger.",
        "Write a detailed grant proposal for an educational research project with methodology.",
        "Design a multi-phase learning curriculum with assessments and adaptive components.",
        "Create a complex data analysis report with visualizations and actionable insights.",
        "Develop a comprehensive five-year strategic plan with scenario planning for market uncertainties.",
        "Write a detailed white paper on emerging industry technology with implementation frameworks.",
        "Create an enterprise-wide digital transformation strategy with phased approach and ROI projections.",
        "Design a complex organizational restructuring plan addressing all stakeholder concerns.",
        "Develop a comprehensive international market entry strategy with risk assessments.",
        "Create a detailed sustainability initiative with measurable environmental and financial impacts.",
        "Write a comprehensive merger and acquisition integration plan covering all business functions.",
        "Design a complex enterprise architecture blueprint for technology systems integration.",
        "Develop a detailed innovation incubator program with governance and funding mechanisms.",
        "Create a comprehensive diversity and inclusion strategy with measurable outcomes and initiatives.",
        "Write a detailed crisis management playbook for multiple potential business disruption scenarios.",
        "Design a complex customer experience transformation strategy with technology requirements.",
        "Develop a comprehensive intellectual property strategy for product innovation protection.",
        "Create a detailed supply chain resilience framework with contingency plans and risk mitigation.",
        "Write a comprehensive corporate social responsibility strategy aligned with business objectives.",
        "Design a complex succession planning framework for all leadership levels.",
        "Develop a detailed brand repositioning strategy with market perception analysis.",
        "Create a comprehensive regulatory compliance framework for a multinational operation.",
        "Write a detailed enterprise risk management strategy with quantifiable assessment methods.",
        "Design a complex product development framework integrating multiple methodologies.",
        "Develop a comprehensive investor relations strategy during a significant business pivot.",
        "Create a detailed cybersecurity strategy addressing advanced persistent threats.",
        "Write a comprehensive cultural transformation roadmap for post-acquisition integration.",
        "Design a complex vendor management framework for critical business partnerships.",
        "Develop a detailed AI implementation strategy across multiple business functions.",
        "Create a comprehensive pricing strategy for a complex product portfolio across markets.",
        "Write a detailed business case for a major capital investment with sensitivity analysis.",
        "Design a complex employee development framework aligned with future capability needs.",
        "Develop a comprehensive customer data strategy compliant with global privacy regulations.",
        "Create a detailed product lifecycle management strategy for a diversified portfolio.",
        "Write a comprehensive research and development roadmap with technology horizon scanning.",
        "Design a complex sales enablement program integrating technology and methodology.",
        "Develop a detailed knowledge management framework for preserving institutional expertise.",
        "Create a comprehensive marketing attribution model for complex customer journeys.",
        "Write a detailed treasury management strategy for multinational cash flow optimization."
    ]
};

/**
 * Gets a random scenario based on the selected difficulty level
 * @param {string} difficulty - The difficulty level (beginner, intermediate, advanced)
 * @returns {string} A random scenario from the selected difficulty
 */
function getRandomScenario(difficulty) {
    // Default to beginner if difficulty is not recognized
    if (!scenarioDatabase[difficulty]) {
        difficulty = 'beginner';
    }
    
    const scenarios = scenarioDatabase[difficulty];
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    return scenarios[randomIndex];
}

// Export the functionality - make sure it works in both Node.js and browser environments
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // Node.js environment
    module.exports = {
        scenarioDatabase,
        getRandomScenario
    };
} else {
    // Browser environment
    // Make functions and data available globally in browser context
    window.scenarioDatabase = scenarioDatabase;
    window.getRandomScenario = getRandomScenario;
}
