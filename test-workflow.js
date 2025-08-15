const { MCPWorkflowOrchestrator } = require('./workflow');

async function testComponents() {
    console.log('🧪 Testing MCP Workflow Components...\n');
    
    const orchestrator = new MCPWorkflowOrchestrator();
    
    try {
        // Test 1: GitHub connection
        console.log('1️⃣ Testing GitHub API connection...');
        const issues = await orchestrator.fetchGitHubIssues();
        console.log(`   ✅ Found ${issues.length} issues\n`);
        
        if (issues.length > 0) {
            // Test 2: Perplexity AI summarization
            console.log('2️⃣ Testing Perplexity AI summarization...');
            const summary = await orchestrator.summarizeIssues(issues.slice(0, 2));
            console.log(`   ✅ Summary generated (${summary.length} chars)\n`);
            // console.log(summary);
            
            // Test 3: Slack posting
            console.log('3️⃣ Testing Slack posting...');
            await orchestrator.postToSlack(summary, issues.slice(0, 1));
            console.log('   ✅ Test message posted to Slack\n');
        }
        
        console.log('🎉 All components tested successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testComponents();
