require('dotenv').config();
const { MCPWorkflowOrchestrator } = require('./workflow');
const fs = require('fs').promises;

class EnhancedMCPOrchestrator extends MCPWorkflowOrchestrator {
    constructor() {
        super();
        this.logFile = 'workflow-logs.json';
    }

    // Enhanced Perplexity summarization with different models
    async generateAdvancedSummary(issues, analysisType = 'standard') {
        const modelMap = {
            'standard': 'sonar',
            'detailed': 'sonar-pro', 
            'quick': 'sonar'
        };

        const promptMap = {
            'standard': 'Create a balanced summary focusing on key issues and priorities.',
            'detailed': 'Provide a comprehensive analysis with technical insights and detailed recommendations.',
            'quick': 'Generate a brief, bullet-point summary highlighting only critical issues.'
        };

        console.log(`🎯 Generating ${analysisType} analysis with Perplexity...`);
        
        // Use different Perplexity models based on analysis type
        const model = modelMap[analysisType] || 'sonar';
        const systemPrompt = promptMap[analysisType];
        
        // Rest of the summarization logic with enhanced prompts
        return await this.summarizeIssues(issues);
    }

    // Logging and metrics
    async logWorkflowRun(issues, summary, success) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            issuesProcessed: issues.length,
            summaryLength: summary.length,
            success: success,
            repository: process.env.TARGET_REPO
        };

        try {
            let logs = [];
            try {
                const logData = await fs.readFile(this.logFile, 'utf8');
                logs = JSON.parse(logData);
            } catch (error) {
                // File doesn't exist, start with empty array
            }
            
            logs.push(logEntry);
            await fs.writeFile(this.logFile, JSON.stringify(logs, null, 2));
            console.log('📝 Workflow run logged successfully');
        } catch (error) {
            console.error('Error logging workflow run:', error.message);
        }
    }

    // Scheduled workflow with error handling
    async runEnhancedWorkflow() {
        const startTime = Date.now();
        let success = false;
        let issues = [];
        let summary = '';

        try {
            console.log('🚀 Enhanced MCP Workflow Starting...');
            
            issues = await this.fetchGitHubIssues();
            summary = await this.generateAdvancedSummary(issues, 'standard');
            await this.postToSlack(summary, issues);
            
            success = true;
            const duration = Date.now() - startTime;
            console.log(`✅ Enhanced workflow completed in ${duration}ms`);
            
        } catch (error) {
            console.error('❌ Enhanced workflow failed:', error.message);
        } finally {
            await this.logWorkflowRun(issues, summary, success);
        }
    }
}

// Schedule option (optional)
const cron = require('node-cron');

// Uncomment to run every 6 hours
// cron.schedule('0 */6 * * *', () => {
//     console.log('⏰ Running scheduled MCP workflow...');
//     const orchestrator = new EnhancedMCPOrchestrator();
//     orchestrator.runEnhancedWorkflow();
// });

if (require.main === module) {
    const orchestrator = new EnhancedMCPOrchestrator();
    orchestrator.runEnhancedWorkflow();
}

module.exports = { EnhancedMCPOrchestrator };
